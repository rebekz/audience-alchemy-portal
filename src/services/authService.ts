import axios from 'axios';

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180';
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'explorer';
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'web';
const KEYCLOAK_CLIENT_SECRET = import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET || 'jrKmVwwj2AOO1t99Hvw8EhonZVE4XYPM';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
}

interface UserInfo {
  sub: string;
  email: string;
  preferred_username: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  roles?: string[];
  // Organization info from Keycloak
  organization?: {
    id: string;
    name: string;
    description?: string;
  };
  organization_id?: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  organization?: {
    id: string;
    name: string;
    description?: string;
  };
}

class AuthService {
  private tokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
  private userInfoEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
  private logoutEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;

  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('client_id', KEYCLOAK_CLIENT_ID);
    formData.append('client_secret', KEYCLOAK_CLIENT_SECRET);
    formData.append('grant_type', 'password');
    formData.append('scope', 'openid organization');
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post<LoginResponse>(this.tokenEndpoint, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Store tokens
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);

      return response.data;
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Handle specific Keycloak errors
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData?.error === 'invalid_client') {
          throw new Error('Client configuration error');
        } else if (errorData?.error === 'invalid_grant') {
          throw new Error('Invalid credentials');
        }
        throw new Error('Invalid request');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Unable to connect to authentication server. Please check if Keycloak is running.');
      }
      
      throw new Error('Authentication failed. Please try again.');
    }
  }

  async getUserInfo(): Promise<UserInfo> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }

    try {
      const response = await axios.get<UserInfo>(this.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to get user info:', error);
      
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        try {
          await this.refreshToken();
          const newToken = localStorage.getItem('access_token');
          const retryResponse = await axios.get<UserInfo>(this.userInfoEndpoint, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });
          return retryResponse.data;
        } catch (refreshError) {
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
      }
      
      throw new Error('Failed to get user information');
    }
  }

  async getUserData(): Promise<UserData> {
    const userInfo = await this.getUserInfo();
    
    // Extract roles from token claims
    const token = localStorage.getItem('access_token');
    let roles: string[] = [];
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        roles = payload.realm_access?.roles || [];
      } catch (error) {
        console.warn('Failed to parse token for roles:', error);
      }
    }
    
    return {
      id: userInfo.sub,
      email: userInfo.email || userInfo.preferred_username || '',
      name: userInfo.name || userInfo.given_name || userInfo.preferred_username || userInfo.email || '',
      role: roles.includes('admin') ? 'admin' : 'user',
      organization: userInfo.organization || (userInfo.organization_id ? {
        id: userInfo.organization_id,
        name: userInfo.organization_id
      } : undefined)
    };
  }

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const formData = new URLSearchParams();
    formData.append('client_id', KEYCLOAK_CLIENT_ID);
    formData.append('client_secret', KEYCLOAK_CLIENT_SECRET);
    formData.append('grant_type', 'refresh_token');
    formData.append('refresh_token', refreshToken);

    try {
      const response = await axios.post<LoginResponse>(this.tokenEndpoint, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Update tokens
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);

      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      throw error;
    }
  }

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Try to logout from Keycloak
    if (refreshToken) {
      try {
        const formData = new URLSearchParams();
        formData.append('client_id', KEYCLOAK_CLIENT_ID);
        formData.append('client_secret', KEYCLOAK_CLIENT_SECRET);
        formData.append('refresh_token', refreshToken);
        
        await axios.post(this.logoutEndpoint, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
      } catch (error) {
        console.warn('Failed to logout from Keycloak:', error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (error) {
      console.warn('Failed to parse token:', error);
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Check if Keycloak is available
  async checkKeycloakAvailability(): Promise<boolean> {
    try {
      console.log('Checking Keycloak availability at:', `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`);
      
      const response = await axios.get(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`, {
        timeout: 5000
      });
      
      console.log('Keycloak is available, response status:', response.status);
      return true;
    } catch (error: any) {
      console.error('Keycloak availability check failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      });
      
      // Log specific error types
      if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused - Keycloak is not running or not accessible');
      } else if (error.code === 'ENOTFOUND') {
        console.error('Host not found - Check your Keycloak URL');
      } else if (error.message.includes('Network Error')) {
        console.error('Network error - Could be CORS issue or network connectivity');
      } else if (error.response?.status === 404) {
        console.error('Realm not found - Check your realm name');
      }
      
      return false;
    }
  }

  // Debug method to test connectivity
  async debugKeycloakConnection(): Promise<{
    isAvailable: boolean;
    error?: string;
    details?: any;
  }> {
    try {
      console.log('=== Keycloak Connection Debug ===');
      console.log('KEYCLOAK_URL:', KEYCLOAK_URL);
      console.log('KEYCLOAK_REALM:', KEYCLOAK_REALM);
      console.log('KEYCLOAK_CLIENT_ID:', KEYCLOAK_CLIENT_ID);
      console.log('Token endpoint:', this.tokenEndpoint);
      console.log('Realm endpoint:', `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`);
      
      // Test basic connectivity
      const response = await axios.get(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`, {
        timeout: 10000
      });
      
      console.log('✅ Successfully connected to Keycloak');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      return {
        isAvailable: true,
        details: {
          status: response.status,
          realm: response.data.realm,
          public_key: response.data.public_key ? 'Present' : 'Missing'
        }
      };
    } catch (error: any) {
      console.error('❌ Failed to connect to Keycloak');
      console.error('Error:', error.message);
      console.error('Error code:', error.code);
      console.error('Error response:', error.response?.data);
      
      return {
        isAvailable: false,
        error: error.message,
        details: {
          code: error.code,
          status: error.response?.status,
          data: error.response?.data
        }
      };
    }
  }
}

export default new AuthService();