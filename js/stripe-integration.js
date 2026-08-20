/**
 * Stripe Payment Integration for Hoopa Connect
 * Handles subscription checkout for Business Pro ($29/mo) and VIP ($79/mo) plans
 */

// Stripe configuration - Replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SAH6lQlOBe24XfGZcFip44PeFr0QtFmVXXUX41fNGhUc4HpUJrOQdcIk5YA3lyrQg8pEhORcz64TeKVM9Qo2NyA00HAGy8foy';

// Load Stripe.js
const stripeScript = document.createElement('script');
stripeScript.src = 'https://js.stripe.com/v3/';
stripeScript.onload = () => {
  window.stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
};
document.head.appendChild(stripeScript);

/**
 * Initialize Stripe checkout for subscription plans
 * @param {string} plan - Plan identifier ('pro' or 'vip')
 * @param {string} businessId - Business ID for the subscription
 * @param {string} businessName - Business name for receipt
 */
async function initiateStripeCheckout(plan, businessId, businessName) {
  try {
    // Validate inputs
    if (!plan || !businessId) {
      throw new Error('Missing required parameters');
    }

    const planDetails = {
      pro: {
        priceId: 'price_1U6NdvQlOBe24XfGMw4xBYpd',
        amount: 29,
        name: 'Business Pro'
      },
      vip: {
        priceId: 'price_1U6NfaQlOBe24XfGIyKSBdNO',
        amount: 79,
        name: 'Platinum VIP'
      }
    };

    const selectedPlan = planDetails[plan];
    if (!selectedPlan) {
      throw new Error('Invalid plan selected');
    }

    // Show loading state
    showLoadingState('Connecting to secure payment...');

    // Create checkout session on your backend
    // Note: This requires a backend endpoint to create the Stripe session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: selectedPlan.priceId,
        businessId: businessId,
        businessName: businessName,
        plan: plan
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw new Error(error.message);
    }

  } catch (error) {
    console.error('Stripe checkout error:', error);
    hideLoadingState();
    showErrorMessage('Payment initialization failed. Please try again or contact support.');
  }
}

/**
 * Handle successful payment return from Stripe
 * Called when user returns from successful checkout
 */
async function handleSuccessfulPayment(sessionId) {
  try {
    showLoadingState('Processing your subscription...');

    // Verify session and update business tier on backend
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId })
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const { success, businessId, newTier } = await response.json();

    if (success) {
      // Update local data
      const data = await loadPortalData();
      const business = (data.directory || []).find(b => b.id === businessId);
      if (business) {
        business.tier = newTier;
        await savePortalData(data);
      }

      hideLoadingState();
      showSuccessMessage(`Successfully upgraded to ${newTier.toUpperCase()}! Your subscription is now active.`);
      
      // Refresh the page to show updated tier
      setTimeout(() => window.location.reload(), 2000);
    } else {
      throw new Error('Subscription activation failed');
    }

  } catch (error) {
    console.error('Payment handling error:', error);
    hideLoadingState();
    showErrorMessage('Subscription activation failed. Please contact support with your payment confirmation.');
  }
}

/**
 * Cancel subscription
 * @param {string} subscriptionId - Stripe subscription ID
 */
async function cancelSubscription(subscriptionId) {
  if (!confirm('Are you sure you want to cancel your subscription? Your listing will remain at the current tier until the end of your billing period.')) {
    return;
  }

  try {
    showLoadingState('Processing cancellation...');

    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId })
    });

    if (!response.ok) {
      throw new Error('Cancellation failed');
    }

    const { success } = await response.json();

    if (success) {
      hideLoadingState();
      showSuccessMessage('Subscription cancelled successfully. You will retain benefits until the end of your billing period.');
    } else {
      throw new Error('Cancellation processing failed');
    }

  } catch (error) {
    console.error('Cancellation error:', error);
    hideLoadingState();
    showErrorMessage('Cancellation failed. Please contact support.');
  }
}

/**
 * Update payment method for existing subscription
 * @param {string} subscriptionId - Stripe subscription ID
 */
async function updatePaymentMethod(subscriptionId) {
  try {
    // Create customer portal session for payment method updates
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId })
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    
    // Redirect to Stripe Customer Portal
    window.location.href = url;

  } catch (error) {
    console.error('Portal session error:', error);
    showErrorMessage('Failed to open payment settings. Please try again.');
  }
}

// UI Helper Functions
function showLoadingState(message) {
  const existing = document.getElementById('stripe-loading');
  if (existing) existing.remove();

  const loadingHtml = `
    <div id="stripe-loading" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;">
      <div style="background:var(--surface);padding:30px;border-radius:12px;text-align:center;">
        <div style="font-size:24px;margin-bottom:16px;">⏳</div>
        <p style="color:var(--text);">${message}</p>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', loadingHtml);
}

function hideLoadingState() {
  const loading = document.getElementById('stripe-loading');
  if (loading) loading.remove();
}

function showSuccessMessage(message) {
  showToast(message, 'success');
}

function showErrorMessage(message) {
  showToast(message, 'error');
}

// Check for payment success on page load
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId && urlParams.get('payment') === 'success') {
    handleSuccessfulPayment(sessionId);
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

// Make functions globally available
window.initiateStripeCheckout = initiateStripeCheckout;
window.cancelSubscription = cancelSubscription;
window.updatePaymentMethod = updatePaymentMethod;
