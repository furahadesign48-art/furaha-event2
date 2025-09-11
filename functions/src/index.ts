import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import Stripe from 'stripe';

// Initialiser Firebase Admin
admin.initializeApp();

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Configuration CORS
const corsHandler = cors({
  origin: [
    'http://localhost:5173',
    'https://localhost:5173',
    'https://your-domain.com' // Remplacez par votre domaine en production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Middleware de vérification Firebase Auth
async function verifyFirebaseToken(req: any): Promise<admin.auth.DecodedIdToken> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token d\'authentification manquant');
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    throw new Error('Token d\'authentification invalide');
  }
}

// Fonction pour créer un PaymentIntent
export const createPaymentIntent = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Vérifier la méthode HTTP
      if (req.method !== 'POST') {
        return res.status(405).json({ 
          error: 'Méthode non autorisée',
          code: 'METHOD_NOT_ALLOWED'
        });
      }

      // Vérifier l'authentification Firebase
      let decodedToken: admin.auth.DecodedIdToken;
      try {
        decodedToken = await verifyFirebaseToken(req);
      } catch (error) {
        return res.status(401).json({ 
          error: 'Non autorisé - Token invalide',
          code: 'UNAUTHORIZED'
        });
      }

      // Valider les données de la requête
      const { plan } = req.body;
      if (!plan || !['standard', 'premium'].includes(plan)) {
        return res.status(400).json({ 
          error: 'Plan invalide. Doit être "standard" ou "premium"',
          code: 'INVALID_PLAN'
        });
      }

      // Configuration des prix (en centimes)
      const prices = {
        standard: 10000, // 100€ en centimes
        premium: 20000,  // 200€ en centimes
      };

      // Récupérer les informations utilisateur
      const userRecord = await admin.auth().getUser(decodedToken.uid);

      // Créer le PaymentIntent avec Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: prices[plan as keyof typeof prices],
        currency: 'eur',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: decodedToken.uid,
          plan: plan,
          userEmail: userRecord.email || '',
        },
        description: `Abonnement ${plan} - Furaha Event`,
        receipt_email: userRecord.email || undefined,
      });

      functions.logger.info('PaymentIntent créé', {
        paymentIntentId: paymentIntent.id,
        userId: decodedToken.uid,
        plan: plan,
        amount: prices[plan as keyof typeof prices]
      });

      return res.status(200).json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });

    } catch (error) {
      functions.logger.error('Erreur lors de la création du PaymentIntent', error);
      
      if (error instanceof Stripe.errors.StripeError) {
        return res.status(400).json({ 
          error: `Erreur Stripe: ${error.message}`,
          code: 'STRIPE_ERROR'
        });
      }

      return res.status(500).json({ 
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  });
});

// Webhook Stripe pour traiter les événements de paiement
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    functions.logger.error('STRIPE_WEBHOOK_SECRET non configuré');
    return res.status(500).send('Configuration webhook manquante');
  }

  let event: Stripe.Event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    functions.logger.error('Erreur de vérification webhook:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  // Traiter l'événement
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        functions.logger.info(`Événement non traité: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    functions.logger.error('Erreur lors du traitement du webhook:', error);
    res.status(500).json({ error: 'Erreur lors du traitement' });
  }
});

// Fonction pour traiter le succès du paiement
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { userId, plan } = paymentIntent.metadata;

  if (!userId || !plan) {
    functions.logger.error('Métadonnées manquantes dans PaymentIntent', {
      paymentIntentId: paymentIntent.id
    });
    return;
  }

  try {
    // Mettre à jour l'abonnement dans Firestore
    const subscriptionData = {
      userId: userId,
      plan: plan,
      status: 'active',
      inviteLimit: plan === 'standard' ? 200 : 999999,
      currentInvites: 0,
      startDate: new Date().toISOString(),
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: paymentIntent.customer as string || null,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await admin.firestore()
      .collection('subscriptions')
      .doc(userId)
      .set(subscriptionData, { merge: true });

    functions.logger.info('Abonnement mis à jour avec succès', {
      userId: userId,
      plan: plan,
      paymentIntentId: paymentIntent.id
    });

    // Optionnel: Envoyer un email de confirmation
    // await sendConfirmationEmail(userId, plan);

  } catch (error) {
    functions.logger.error('Erreur lors de la mise à jour de l\'abonnement', {
      error: error,
      userId: userId,
      paymentIntentId: paymentIntent.id
    });
  }
}

// Fonction pour traiter l'échec du paiement
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { userId, plan } = paymentIntent.metadata;

  functions.logger.warn('Paiement échoué', {
    userId: userId,
    plan: plan,
    paymentIntentId: paymentIntent.id,
    lastPaymentError: paymentIntent.last_payment_error
  });

  // Optionnel: Notifier l'utilisateur de l'échec
  // await sendPaymentFailureNotification(userId);
}