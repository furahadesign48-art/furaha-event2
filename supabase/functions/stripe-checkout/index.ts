const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { planType, userId, userEmail, successUrl, cancelUrl } = await req.json()

    // Configuration des plans
    const plans = {
      standard: {
        priceId: 'price_1QYourRealPriceId1', // Remplacez par votre vrai Price ID
        name: 'Plan Standard',
      },
      premium: {
        priceId: 'price_1QYourRealPriceId2', // Remplacez par votre vrai Price ID
        name: 'Plan Premium',
      },
    }

    const selectedPlan = plans[planType as keyof typeof plans]
    if (!selectedPlan) {
      throw new Error('Plan invalide')
    }

    // Vérifier les variables d'environnement
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY non configuré')
    }

    // Importer Stripe dynamiquement
    const { default: Stripe } = await import('https://esm.sh/stripe@14.21.0')
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        planType: planType,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planType: planType,
        },
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})