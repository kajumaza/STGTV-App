document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (!token || !username) {
    console.log('No token or username found, redirecting to login page');
    window.location.href = '/index.html';
    return;
  }
  console.log('Token and username found, user is authenticated');
  fetchUserTier();
  loadSavedCredentials();
  
  document.getElementById('logout').addEventListener('click', logout);
  document.getElementById('save-stagwell-credentials').addEventListener('click', saveStgwellCredentials);
  document.getElementById('upgrade-tier').addEventListener('click', upgradeTier);
  document.getElementById('schedule-automation').addEventListener('click', scheduleAutomation);
  document.getElementById('run-automation').addEventListener('click', runImmediateAutomation);
});

async function fetchUserTier() {
  try {
    const response = await fetch('/user-info', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('userTier', data.tier);
      document.getElementById('user-tier').textContent = data.tier;
    } else {
      throw new Error('Failed to fetch user tier');
    }
  } catch (error) {
    console.error('Error fetching user tier:', error);
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('stagwellTelephone');
  localStorage.removeItem('stagwellPassword');
  window.location.href = '/index.html';
}

async function saveStgwellCredentials() {
  // Get the input elements
  const telephoneInput = document.getElementById('stagwell-telephone');
  const passwordInput = document.getElementById('stagwell-password');
  
  // Get the values
  const stagwellTelephone = telephoneInput.value;
  const stagwellPassword = passwordInput.value;
  
  try {
    const response = await fetch('/save-stagwell-credentials', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stagwellTelephone, stagwellPassword })
    });
    
    if (response.ok) {
      // Clear the input fields immediately after successful save
      telephoneInput.value = '';
      passwordInput.value = '';
      
      // Show success message
      alert('Stagwell TV credentials saved successfully!');
      
      // Store in localStorage if needed
      localStorage.setItem('stagwellTelephone', stagwellTelephone);
      localStorage.setItem('stagwellPassword', stagwellPassword);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save credentials');
    }
  } catch (error) {
    console.error('Error saving Stagwell TV credentials:', error);
    alert(`Failed to save credentials: ${error.message}`);
  }
}

async function loadSavedCredentials() {
  try {
    const response = await fetch('/get-stagwell-credentials', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.stagwellTelephone) {
        document.getElementById('stagwell-telephone').value = data.stagwellTelephone;
      }
      if (data.stagwellPassword) {
        document.getElementById('stagwell-password').value = data.stagwellPassword;
      }
      if (data.stagwellTier) {
        localStorage.setItem('userTier', data.stagwellTier);
      }
    } else {
      console.error('Failed to fetch saved credentials');
    }
  } catch (error) {
    console.error('Error loading saved credentials:', error);
  }
}

async function upgradeTier() {
  const currentTier = document.getElementById('user-tier').textContent;
  const higherTiers = getHigherTiers(currentTier);
  if (higherTiers.length > 0) {
    const tierOptions = higherTiers.map(tier => `${tier} - R${getTierPrice(tier)}`).join('\n');
    const selectedTier = prompt(`Select the tier you want to upgrade to:\n${tierOptions}`);
    if (selectedTier) {
      const tier = selectedTier.split(' - ')[0];
      const confirmed = confirm(`Do you want to upgrade to tier ${tier}?`);
      if (confirmed) {
        try {
          const response = await fetch('/process-upgrade', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tier })
          });
          const result = await response.json();
          if (result.success) {
            alert(`Upgrade to ${tier} successful! Transaction ID: ${result.transactionId}`);
            fetchUserTier(); // Refresh the displayed tier
          } else {
            alert(`Upgrade failed: ${result.error}`);
          }
        } catch (error) {
          console.error('Error during upgrade:', error);
          alert('An error occurred during the upgrade process. Please try again.');
        }
      }
    }
  } else {
    alert('You are already on the highest tier.');
  }
}

function getHigherTiers(currentTier) {
  const tiers = ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8'];
  const currentIndex = tiers.indexOf(currentTier);
  return tiers.slice(currentIndex + 1);
}

function getTierPrice(tier) {
  const tierPrices = { K1: 24, K2: 90, K3: 216, K4: 720, K5: 1380, K6: 2000, K7: 2500, K8: 3000 };
  return tierPrices[tier];
}

async function scheduleAutomation(e) {
  e.preventDefault();
  await runAutomation('/schedule-automation', 'Automation scheduled successfully!');
}

async function runImmediateAutomation(e) {
  e.preventDefault();
  await runAutomation('/run-immediate-automation', 'Immediate automation started successfully!');
}

async function runAutomation(endpoint, successMessage) {
  const stagwellTelephone = document.getElementById('stagwell-telephone').value;
  const stagwellPassword = document.getElementById('stagwell-password').value;
  const stagwellTier = localStorage.getItem('userTier');

  if (!stagwellTelephone || !stagwellPassword) {
    try {
      const response = await fetch('/get-stagwell-credentials', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.stagwellTelephone && data.stagwellPassword) {
          await startAutomation(endpoint, data.stagwellTelephone, data.stagwellPassword, data.stagwellTier || stagwellTier, successMessage);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching saved credentials:', error);
    }
    alert('Please enter your Stagwell TV credentials before starting automation.');
    return;
  }

  await startAutomation(endpoint, stagwellTelephone, stagwellPassword, stagwellTier, successMessage);
}

async function startAutomation(endpoint, stagwellTelephone, stagwellPassword, stagwellTier, successMessage) {
  if (!stagwellTier) {
    alert('User tier information is missing. Please try logging out and logging in again.');
    return;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stagwellTelephone, stagwellPassword, stagwellTier })
    });

    if (response.ok) {
      alert(successMessage);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to start automation');
    }
  } catch (error) {
    console.error('Error:', error);
    alert(`Failed to start automation: ${error.message}`);
  }
}

async function fetchStagwellCredentials() {
  try {
    const response = await fetch('/get-stagwell-credentials', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to fetch Stagwell credentials');
      return null;
    }
  } catch (error) {
    console.error('Error fetching Stagwell credentials:', error);
    return null;
  }
}