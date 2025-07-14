import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, AlertCircle, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import authService from '@/services/authService';

interface LoginFormProps {
  onLogin: (userData: any) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [keycloakAvailable, setKeycloakAvailable] = useState<boolean | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check Keycloak availability on component mount
    const checkKeycloak = async () => {
      const available = await authService.checkKeycloakAvailability();
      setKeycloakAvailable(available);
    };
    checkKeycloak();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate with Keycloak
      await authService.login(username, password);
      
      // Get user data
      const userData = await authService.getUserData();
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      });
      
      onLogin(userData);
    } catch (error: any) {
      console.error('Login error:', error);
      
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugConnection = async () => {
    setIsLoading(true);
    try {
      // First, log environment variables
      console.log('=== Environment Variables ===');
      console.log('VITE_KEYCLOAK_URL:', import.meta.env.VITE_KEYCLOAK_URL);
      console.log('VITE_KEYCLOAK_REALM:', import.meta.env.VITE_KEYCLOAK_REALM);
      console.log('VITE_KEYCLOAK_CLIENT_ID:', import.meta.env.VITE_KEYCLOAK_CLIENT_ID);
      console.log('VITE_KEYCLOAK_CLIENT_SECRET:', import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET ? '***SET***' : 'NOT SET');
      console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
      
      const result = await (authService as any).debugKeycloakConnection();
      
      if (result.isAvailable) {
        toast({
          title: "✅ Keycloak Connected",
          description: "Successfully connected to Keycloak. Check console for details.",
        });
        setKeycloakAvailable(true);
      } else {
        toast({
          title: "❌ Keycloak Connection Failed",
          description: result.error || "Failed to connect to Keycloak. Check console for details.",
          variant: "destructive",
        });
        setKeycloakAvailable(false);
      }
    } catch (error: any) {
      toast({
        title: "Debug Failed",
        description: error.message || "Failed to run debug test",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real implementation, this would call a password reset endpoint
      // For now, just show a message
      toast({
        title: "Password Reset",
        description: "Please contact your administrator to reset your password.",
      });
      setShowReset(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (showReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-900">Reset Password</CardTitle>
            <CardDescription>Contact your administrator for password reset</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="reset-username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Request Password Reset'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setShowReset(false)}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Login to Audience Explorer</h1>
            <p className="text-gray-600 mt-1">Enter your email</p>
          </div>

          {/* Error Alerts */}
          {keycloakAvailable === false && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to connect to authentication server. Please check if Keycloak is running.
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2 text-blue-600 hover:text-blue-700"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  Debug Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {showDebug && (
            <Alert className="mb-4">
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Debug Information:</p>
                  <p className="text-xs">Check browser console for detailed logs</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDebugConnection}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative">
                <Input
                  id="username"
                  type="email"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto"
                  onClick={() => setShowReset(true)}
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-md font-medium transition-colors" 
              disabled={isLoading || keycloakAvailable === false}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
          </form>

        </div>
      </div>

      {/* Right Panel - Brand Section */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background with gradient overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')`,
          }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-purple-900/90"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center p-8">
          <div className="text-center text-white">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <User className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-semibold">Audience Explorer</span>
              </div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Discover Your<br />
                Target Audience
              </h2>
              <p className="text-lg text-blue-100 max-w-md mx-auto">
                Advanced analytics and insights to understand and reach your ideal customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
