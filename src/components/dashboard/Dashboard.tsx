
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, Users, BarChart3, Settings, Filter, RefreshCw } from 'lucide-react';
import AudienceBuilder from '@/components/audience/AudienceBuilder';
import AudienceCard from '@/components/audience/AudienceCard';
import AdminPanel from '@/components/admin/AdminPanel';
import audienceService from '@/services/audienceService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('audiences');
  const [showBuilder, setShowBuilder] = useState(false);
  const [audiences, setAudiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch audiences from backend
  const fetchAudiences = async () => {
    try {
      setIsLoading(true);
      const data = await audienceService.getAllAudiences();
      
      // Transform backend data to match frontend format
      const transformedAudiences = data.map((audience: any) => ({
        id: audience.id,
        name: audience.name,
        description: audience.description,
        size: Math.floor(Math.random() * 100000) + 10000, // Placeholder until we have real data
        criteria: audience.latest_version?.segments?.length || 0,
        lastUpdated: new Date(audience.updated_at).toLocaleString(),
        status: audience.latest_version?.is_active ? 'active' : 'inactive',
        created_by: audience.created_by
      }));
      
      setAudiences(transformedAudiences);
    } catch (error) {
      console.error('Failed to fetch audiences:', error);
      // Use demo data if API fails
      setAudiences([
        {
          id: '1',
          name: 'High-Value Mobile Gamers',
          description: 'Premium users aged 25-35 with high engagement',
          size: 45000,
          criteria: 3,
          lastUpdated: '2 hours ago',
          status: 'active'
        },
        {
          id: '2',
          name: 'Fashion Enthusiasts',
          description: 'Female shoppers interested in fashion and lifestyle',
          size: 78000,
          criteria: 5,
          lastUpdated: '1 day ago',
          status: 'syncing'
        },
        {
          id: '3',
          name: 'Tech Early Adopters',
          description: 'Users who engage with technology content',
          size: 32000,
          criteria: 4,
          lastUpdated: '3 days ago',
          status: 'active'
        }
      ]);
      toast({
        title: "Demo Mode",
        description: "Running in demo mode. Backend connection unavailable.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load audiences on component mount
  useEffect(() => {
    fetchAudiences();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAudiences();
  };

  const handleCreateAudience = async (audienceData: any) => {
    try {
      const segments = audienceData.criteria?.map((criterion: any) => ({
        name: criterion.name || 'Segment',
        type: 'universe',
        filters: criterion.filters || {}
      })) || [];

      const createRequest = {
        name: audienceData.name,
        description: audienceData.description,
        segments: segments,
        created_by: user.email
      };

      const newAudience = await audienceService.createAudience(createRequest);
      
      toast({
        title: "Success",
        description: "Audience created successfully!",
      });

      await fetchAudiences(); // Refresh the list
      setShowBuilder(false);
    } catch (error) {
      console.error('Failed to create audience:', error);
      toast({
        title: "Error",
        description: "Failed to create audience. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (showBuilder) {
    return <AudienceBuilder onSave={handleCreateAudience} onCancel={() => setShowBuilder(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-900">Audience Manager</h1>
              <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="ghost" onClick={onLogout} className="text-gray-600 hover:text-gray-900">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audiences" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Audiences
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="audiences" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Audiences</p>
                      <p className="text-2xl font-bold text-blue-900">{audiences.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Reach</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {(audiences.reduce((sum, aud) => sum + aud.size, 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Syncs</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {audiences.filter(a => a.status === 'active').length}
                      </p>
                    </div>
                    <Filter className="h-8 w-8 text-teal-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Size</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {(audiences.reduce((sum, aud) => sum + aud.size, 0) / audiences.length / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Audiences</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={handleRefresh} 
                  variant="outline"
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={() => setShowBuilder(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Audience
                </Button>
              </div>
            </div>

            {/* Audience Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Show loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : audiences.length === 0 ? (
                // Show empty state
                <div className="col-span-full text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No audiences yet</h3>
                  <p className="text-gray-500 mb-4">Create your first audience to get started</p>
                  <Button onClick={() => setShowBuilder(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Audience
                  </Button>
                </div>
              ) : (
                // Show audience cards
                audiences.map((audience) => (
                  <AudienceCard key={audience.id} audience={audience} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  View comprehensive audience performance metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Advanced analytics charts will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
