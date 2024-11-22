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
          console.log('Fetched user data:', data); // Debug log
          
          // Check for tier in different possible locations
          const tier = data.tier || data['user-tier'] || data.userTier;
          
          if (tier) {
              localStorage.setItem('userTier', tier);
              const userTierElement = document.getElementById('user-tier');
              if (userTierElement) {
                  userTierElement.textContent = tier;
                  console.log('Updated tier display to:', tier);
              }
          } else {
              console.error('No tier found in user data:', data);
          }
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

// async function saveStgwellCredentials() {
//   const stagwellTelephone = document.getElementById('stagwell-telephone').value;
//   const stagwellPassword = document.getElementById('stagwell-password').value;
  
//   // Add validation for empty fields
//   if (!stagwellTelephone || !stagwellPassword) {
//       alert('Please complete both telephone and password fields before saving.');
//       return;
//   }

//   try {
//       // First, check if credentials already exist
//       const existingCreds = await fetch('/get-stagwell-credentials', {
//           headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       if (existingCreds.ok) {
//           const data = await existingCreds.json();
//           if (data.stagwellTelephone) {
//               if (data.stagwellTelephone === stagwellTelephone) {
//                   alert('These credentials are already saved in the system.');
//               } else {
//                   alert('You already have Stagwell credentials saved. Only one set of credentials is allowed per account.');
//               }
//               return;
//           }
//       }

//       const response = await fetch('/save-stagwell-credentials', {
//           method: 'POST',
//           headers: {
//               'Authorization': `Bearer ${localStorage.getItem('token')}`,
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ stagwellTelephone, stagwellPassword })
//       });
      
//       if (response.ok) {
//           alert('Stagwell TV credentials saved successfully!');
//           // Clear the input fields after successful save
//           document.getElementById('stagwell-telephone').value = '';
//           document.getElementById('stagwell-password').value = '';
//           // Reload saved credentials to display them
//           loadSavedCredentials();
//       } else {
//           const errorData = await response.json();
//           throw new Error(errorData.error || 'Failed to save credentials');
//       }
//   } catch (error) {
//       console.error('Error saving Stagwell TV credentials:', error);
//       alert(`Failed to save credentials: ${error.message}`);
//   }
// }

// async function saveStgwellCredentials() {
//   const stagwellTelephone = document.getElementById('stagwell-telephone').value;
//   const stagwellPassword = document.getElementById('stagwell-password').value;
//   const stagwellTier = localStorage.getItem('userTier'); // Get current tier

//   // Add validation for empty fields
//   if (!stagwellTelephone || !stagwellPassword) {
//       alert('Please complete both telephone and password fields before saving.');
//       return;
//   }

//   try {
//       // First, check if credentials already exist
//       const existingCreds = await fetch('/get-stagwell-credentials', {
//           headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//       });
      
//       if (existingCreds.ok) {
//           const data = await existingCreds.json();
//           if (data.stagwellTelephone) {
//               if (data.stagwellTelephone === stagwellTelephone) {
//                   alert('These credentials are already saved in the system.');
//               } else {
//                   alert('You already have Stagwell credentials saved. Only one set of credentials is allowed per account.');
//               }
//               return;
//           }
//       }

//       const response = await fetch('/save-stagwell-credentials', {
//           method: 'POST',
//           headers: {
//               'Authorization': `Bearer ${localStorage.getItem('token')}`,
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ 
//               stagwellTelephone, 
//               stagwellPassword,
//               'user-tier': stagwellTier  // Include the tier when saving
//           })
//       });
      
//       if (response.ok) {
//           alert('Stagwell TV credentials saved successfully!');
//           document.getElementById('stagwell-telephone').value = '';
//           document.getElementById('stagwell-password').value = '';
//           loadSavedCredentials();
//       } else {
//           const errorData = await response.json();
//           throw new Error(errorData.error || 'Failed to save credentials');
//       }
//   } catch (error) {
//       console.error('Error saving Stagwell TV credentials:', error);
//       alert(`Failed to save credentials: ${error.message}`);
//   }
// }

async function saveStgwellCredentials() {
  const stagwellTelephone = document.getElementById('stagwell-telephone').value;
  const stagwellPassword = document.getElementById('stagwell-password').value;
  const stagwellTier = localStorage.getItem('userTier'); // Get the tier from localStorage
  
  // Add validation for empty fields
  if (!stagwellTelephone || !stagwellPassword) {
      alert('Please complete both telephone and password fields before saving.');
      return;
  }

  try {
      // First, check if credentials already exist
      const existingCreds = await fetch('/get-stagwell-credentials', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (existingCreds.ok) {
          const data = await existingCreds.json();
          if (data.stagwellTelephone) {
              if (data.stagwellTelephone === stagwellTelephone) {
                  alert('These credentials are already saved in the system.');
              } else {
                  alert('You already have Stagwell credentials saved. Only one set of credentials is allowed per account.');
              }
              return;
          }
      }

      const response = await fetch('/save-stagwell-credentials', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
              stagwellTelephone, 
              stagwellPassword,
              'user-tier': stagwellTier // Include the tier
          })
      });
      
      if (response.ok) {
          alert('Stagwell TV credentials saved successfully!');
          document.getElementById('stagwell-telephone').value = '';
          document.getElementById('stagwell-password').value = '';
          loadSavedCredentials();
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
          console.log('Loaded credentials:', data); // Debug log
          
          if (data.stagwellTelephone) {
              document.getElementById('stagwell-telephone').value = data.stagwellTelephone;
              document.getElementById('stagwell-telephone').disabled = true;
          }
          
          if (data.stagwellPassword) {
              document.getElementById('stagwell-password').value = '********';
              document.getElementById('stagwell-password').disabled = true;
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