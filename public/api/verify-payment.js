// Fichier de simulation pour la vérification de paiement
// Dans un vrai projet, ceci serait sur votre serveur backend

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  // Dans un vrai projet, vous vérifieriez la session avec Stripe :
  /*
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  const session = await stripe.checkout.sessions.retrieve(session_id);
  
  if (session.payment_status === 'paid') {
    // Mettre à jour l'abonnement de l'utilisateur dans votre base de données
    // Envoyer un email de confirmation
    // etc.
  }
  */

  // Simulation d'une vérification réussie
  const mockPlans = ['standard', 'premium'];
  const randomPlan = mockPlans[Math.floor(Math.random() * mockPlans.length)];

  res.status(200).json({
    success: true,
    plan: randomPlan,
    session_id: session_id,
    payment_status: 'paid',
    customer_email: 'user@example.com'
  });
}