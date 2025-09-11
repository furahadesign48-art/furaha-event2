const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();

// 🔒 Middleware de vérification Firebase Auth
async function verifyFirebaseToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token manquant");
  }

  const idToken = authHeader.split("Bearer ")[1];
  return admin.auth().verifyIdToken(idToken);
}

// ✅ Créer un PaymentIntent
exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Méthode non autorisée" });
      }

      // Vérification JWT Firebase
      const decoded = await verifyFirebaseToken(req);

      const { plan } = req.body;
      if (!plan) {
        return res.status(400).json({ error: "Plan manquant" });
      }

      // Prix selon le plan
      const prices = {
        standard: 10000, // 100$ en cents
        premium: 20000,  // 200$ en cents
      };

      if (!prices[plan]) {
        return res.status(400).json({ error: "Plan invalide" });
      }

      // Création PaymentIntent Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: prices[plan],
        currency: "usd",
        metadata: {
          uid: decoded.uid,
          plan: plan,
        },
      });

      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Erreur PaymentIntent:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ✅ Webhook Stripe
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Erreur webhook Stripe:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Vérifier le type d'événement
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    const uid = paymentIntent.metadata.uid;
    const plan = paymentIntent.metadata.plan;

    // Mettre à jour Firestore avec l’abonnement
    await admin.firestore().collection("subscriptions").doc(uid).set({
      plan,
      status: "active",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Abonnement mis à jour pour UID ${uid}, plan ${plan}`);
  }

  res.json({ received: true });
});
