// Simple debug script to test Keycloak connectivity
// Run this in browser console or as a Node.js script

const KEYCLOAK_URL = 'http://localhost:8180';
const KEYCLOAK_REALM = 'explorer';
const KEYCLOAK_CLIENT_ID = 'web';
const KEYCLOAK_CLIENT_SECRET = 'jrKmVwwj2AOO1t99Hvw8EhonZVE4XYPM';

async function debugKeycloak() {
  console.log('=== Keycloak Debug Test ===');
  console.log('KEYCLOAK_URL:', KEYCLOAK_URL);
  console.log('KEYCLOAK_REALM:', KEYCLOAK_REALM);
  console.log('KEYCLOAK_CLIENT_ID:', KEYCLOAK_CLIENT_ID);
  
  const realmUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;
  const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
  
  console.log('Realm URL:', realmUrl);
  console.log('Token URL:', tokenUrl);
  
  try {
    // Test 1: Check if Keycloak realm is accessible
    console.log('\n1. Testing realm accessibility...');
    const realmResponse = await fetch(realmUrl);
    console.log('✅ Realm response status:', realmResponse.status);
    
    if (realmResponse.ok) {
      const realmData = await realmResponse.json();
      console.log('✅ Realm data:', realmData);
    } else {
      console.error('❌ Realm not accessible:', realmResponse.statusText);
      return;
    }
    
    // Test 2: Test token endpoint with the working credentials
    console.log('\n2. Testing token endpoint with credentials...');
    const formData = new URLSearchParams();
    formData.append('client_id', KEYCLOAK_CLIENT_ID);
    formData.append('client_secret', KEYCLOAK_CLIENT_SECRET);
    formData.append('grant_type', 'password');
    formData.append('scope', 'openid organization');
    formData.append('username', 'fitra@eureka.ai');
    formData.append('password', 'fitra123');
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    
    console.log('Token response status:', tokenResponse.status);
    
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      console.log('✅ Token received successfully!');
      console.log('Access token present:', !!tokenData.access_token);
      console.log('Refresh token present:', !!tokenData.refresh_token);
      console.log('Token type:', tokenData.token_type);
      console.log('Expires in:', tokenData.expires_in);
      
      // Test 3: Test userinfo endpoint
      console.log('\n3. Testing userinfo endpoint...');
      const userinfoUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
      const userinfoResponse = await fetch(userinfoUrl, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });
      
      if (userinfoResponse.ok) {
        const userinfo = await userinfoResponse.json();
        console.log('✅ User info received successfully!');
        console.log('User info:', userinfo);
      } else {
        console.error('❌ Failed to get user info:', userinfoResponse.statusText);
      }
      
    } else {
      const errorData = await tokenResponse.json();
      console.error('❌ Token request failed:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Error during debug test:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  }
}

// Run the debug test
debugKeycloak().then(() => {
  console.log('\n=== Debug test completed ===');
});

// Also expose as a global function for manual testing
if (typeof window !== 'undefined') {
  window.debugKeycloak = debugKeycloak;
  console.log('Debug function available as window.debugKeycloak()');
} 