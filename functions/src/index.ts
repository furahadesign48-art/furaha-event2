import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import * as cors from 'cors';

// Initialiser Firebase Admin
admin.initializeApp();

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

// Configuration CORS
const corsHandler = cors({ origin: true });

// Interface pour les plans
interface PlanConfig {
  amount: number;
  currency: string;
  name: string;
  features: string[];
}

const PLANS: Record<string, PlanConfig> = {
  standard: {
    amount: 10000, // 100€ en centimes
    currency: 'eur',
    name: 'Plan Standard',
    features: ['200 invitations maximum', 'Tous les modèles premium', 'Support prioritaire']
  },
  premium: {
    amount: 20000, // 200€ en centimes
    currency: 'eur',
    name: 'Plan Premium',
    features: ['Invitations illimitées', 'Design sur mesure', 'API d\'intégration']
  }
};

// Fonction pour créer un PaymentIntent
export const createPaymentIntent = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Vérifier la méthode HTTP
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      // Vérifier l'authentification Firebase
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        return;
      }

      const idToken = authHeader.split('Bearer ')[1];
      let decodedToken;
      
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
      }

      const { planId, customerInfo } = req.body;

      // Valider les données d'entrée
      if (!planId || !PLANS[planId]) {
        res.status(400).json({ error: 'Invalid plan ID' });
        return;
      }

      if (!customerInfo || !customerInfo.email || !customerInfo.name) {
        res.status(400).json({ error: 'Missing customer information' });
        return;
      }

      const plan = PLANS[planId];
      const userId = decodedToken.uid;

      // Créer ou récupérer le client Stripe
      let customer;
      try {
        // Chercher un client existant par email
        const existingCustomers = await stripe.customers.list({
          email: customerInfo.email,
          limit: 1
        });

        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          // Créer un nouveau client
          customer = await stripe.customers.create({
            email: customerInfo.email,
            name: customerInfo.name,
            metadata: {
              firebase_uid: userId,
              plan_id: planId
            }
          });
        }
      } catch (error) {
        console.error('Error creating/retrieving customer:', error);
        res.status(500).json({ error: 'Failed to create customer' });
        return;
      }

      // Créer le PaymentIntent
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: plan.amount,
          currency: plan.currency,
          customer: customer.id,
          metadata: {
            firebase_uid: userId,
            plan_id: planId,
            plan_name: plan.name
          },
          description: `Abonnement ${plan.name} - Furaha Event`,
          receipt_email: customerInfo.email,
          automatic_payment_methods: {
            enabled: true,
          },
        });

        // Sauvegarder les informations de paiement dans Firestore
        await admin.firestore().collection('payment_intents').doc(paymentIntent.id).set({
          userId,
          planId,
          amount: plan.amount,
          currency: plan.currency,
          status: paymentIntent.status,
          customerId: customer.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          customerId: customer.id,
          plan: {
            id: planId,
            name: plan.name,
            amount: plan.amount,
            currency: plan.currency
          }
        });

      } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
        return;
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Webhook pour gérer les événements Stripe
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err}`);
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Fonction pour gérer le succès du paiement
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.firebase_uid;
  const planId = paymentIntent.metadata.plan_id;

  if (!userId || !planId) {
    console.error('Missing metadata in payment intent:', paymentIntent.id);
    return;
  }

  const db = admin.firestore();
  const batch = db.batch();

  try {
    // Mettre à jour le statut du PaymentIntent
    const paymentIntentRef = db.collection('payment_intents').doc(paymentIntent.id);
    batch.update(paymentIntentRef, {
      status: 'succeeded',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Mettre à jour l'abonnement de l'utilisateur
    const subscriptionRef = db.collection('subscriptions').doc(userId);
    const subscriptionData = {
      userId,
      plan: planId,
      status: 'active',
      inviteLimit: planId === 'standard' ? 200 : 999999,
      currentInvites: 0,
      startDate: new Date().toISOString(),
      stripeCustomerId: paymentIntent.customer as string,
      stripePaymentIntentId: paymentIntent.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    batch.set(subscriptionRef, subscriptionData, { merge: true });

    // Créer un enregistrement de transaction
    const transactionRef = db.collection('transactions').doc();
    batch.set(transactionRef, {
      userId,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'completed',
      planId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();
    console.log(`Payment succeeded for user ${userId}, plan ${planId}`);

  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

// Fonction pour gérer l'échec du paiement
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.firebase_uid;

  if (!userId) {
    console.error('Missing user ID in payment intent:', paymentIntent.id);
    return;
  }

  const db = admin.firestore();

  try {
    // Mettre à jour le statut du PaymentIntent
    await db.collection('payment_intents').doc(paymentIntent.id).update({
      status: 'failed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Créer un enregistrement de transaction échouée
    await db.collection('transactions').add({
      userId,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'failed',
      planId: paymentIntent.metadata.plan_id,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Payment failed for user ${userId}`);

  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

// Fonction pour gérer les changements d'abonnement
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  try {
    // Récupérer le client pour obtenir l'ID utilisateur
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    const userId = customer.metadata?.firebase_uid;

    if (!userId) {
      console.error('No Firebase UID found for customer:', customerId);
      return;
    }

    const db = admin.firestore();
    
    // Mettre à jour l'abonnement dans Firestore
    await db.collection('subscriptions').doc(userId).update({
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Subscription updated for user ${userId}`);

  } catch (error) {
    console.error('Error handling subscription change:', error);
    throw error;
  }
}

// Fonction pour gérer l'annulation d'abonnement
async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  try {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    const userId = customer.metadata?.firebase_uid;

    if (!userId) {
      console.error('No Firebase UID found for customer:', customerId);
      return;
    }

    const db = admin.firestore();
    
    // Rétrograder vers le plan gratuit
    await db.collection('subscriptions').doc(userId).update({
      plan: 'free',
      status: 'cancelled',
      inviteLimit: 5,
      endDate: new Date().toISOString(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Subscription cancelled for user ${userId}`);

  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

// Fonction pour récupérer l'historique des paiements
export const getPaymentHistory = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      // Vérifier l'authentification
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      // Récupérer l'historique des transactions
      const transactionsSnapshot = await admin.firestore()
        .collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.status(200).json({ transactions });

    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});