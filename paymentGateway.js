// paymentGateway.js
class PaymentGateway {
    constructor() {
      this.pricing = {
        K1: 24,
        K2: 90,
        K3: 216,
        K4: 720,
        K5: 1380,
        K6: 2000,
        K7: 2500,
        K8: 3000
      };
    }
  
    async processPayment(tier) {
      const amount = this.pricing[tier];
      if (!amount) {
        throw new Error(`Invalid tier: ${tier}`);
      }
  
      console.log(`Processing payment for tier ${tier}: R${amount}`);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Simulate a successful payment (you can add logic here to sometimes return a failed payment)
      const success = Math.random() < 0.9; // 90% success rate
  
      if (success) {
        return { success: true, transactionId: `fake-transaction-id-${Date.now()}` };
      } else {
        return { success: false, error: 'Payment failed' };
      }
    }
  }
  
  module.exports = PaymentGateway;
  
  // main.js
  async function handleRegister(e) {
      e.preventDefault();
      const username = document.getElementById('reg-username').value;
      const email = document.getElementById('reg-email').value;
      const telephone = document.getElementById('reg-telephone').value;
      const password = document.getElementById('reg-password').value;
      const tier = document.getElementById('reg-tier').value;
  
      const paymentGateway = new PaymentGateway();
  
      try {
          const paymentResult = await paymentGateway.processPayment(tier);
          if (!paymentResult.success) {
              throw new Error('Payment failed');
          }
  
          const response = await fetch('/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, email, telephone, password, tier, transactionId: paymentResult.transactionId }),
          });
  
          if (response.ok) {
              const data = await response.json();
              console.log('Registration successful, received data:', data);
              alert('Registration and payment successful. Please log in.');
              document.getElementById('register').reset();
          } else {
              const errorData = await response.json();
              console.error('Registration failed:', errorData);
              alert(`Registration failed: ${errorData.error}`);
          }
      } catch (error) {
          console.error('Error during registration or payment:', error);
          alert('An error occurred during registration or payment. Please try again.');
      }
  }

  