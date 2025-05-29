
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Trash2, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AudienceCharts from '@/components/audience/AudienceCharts';

interface AudienceBuilderProps {
  onSave: (audienceData: any) => void;
  onCancel: () => void;
}

const AudienceBuilder = ({ onSave, onCancel }: AudienceBuilderProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<any[]>([]);
  const [audienceSize, setAudienceSize] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const addCriteria = (type: string) => {
    const newCriteria = {
      id: Date.now(),
      type,
      operator: 'AND',
      config: {}
    };
    setCriteria([...criteria, newCriteria]);
  };

  const removeCriteria = (id: number) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const updateCriteria = (id: number, field: string, value: any) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const calculateAudienceSize = async () => {
    setIsCalculating(true);
    // Simulate API call for audience sizing
    await new Promise(resolve => setTimeout(resolve, 1000));
    const baseSize = 100000;
    const reductionFactor = criteria.length * 0.3;
    const newSize = Math.max(1000, Math.floor(baseSize * (1 - reductionFactor) + Math.random() * 20000));
    setAudienceSize(newSize);
    setIsCalculating(false);
  };

  useEffect(() => {
    if (criteria.length > 0) {
      calculateAudienceSize();
    } else {
      setAudienceSize(0);
    }
  }, [criteria]);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an audience name",
        variant: "destructive",
      });
      return;
    }

    onSave({
      name,
      description,
      criteria,
      size: audienceSize
    });

    toast({
      title: "Audience Created",
      description: `${name} has been successfully created with ${audienceSize.toLocaleString()} users`,
    });
  };

  const renderProfilesBlock = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profiles</CardTitle>
        <CardDescription>Define demographic and behavioral characteristics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Age Group</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-24">18-24</SelectItem>
                <SelectItem value="25-34">25-34</SelectItem>
                <SelectItem value="35-44">35-44</SelectItem>
                <SelectItem value="45-54">45-54</SelectItem>
                <SelectItem value="55+">55+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Gender</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>SES (Socioeconomic Status)</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select SES" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Risk Score</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (0-3)</SelectItem>
                <SelectItem value="medium">Medium (4-6)</SelectItem>
                <SelectItem value="high">High (7-10)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderInteractionsBlock = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">User Interactions</CardTitle>
        <CardDescription>Define engagement patterns and interests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Application</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select app" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile">Mobile App</SelectItem>
                <SelectItem value="web">Web Platform</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Interests</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select interests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Category</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">Premium Users</SelectItem>
                <SelectItem value="active">Active Users</SelectItem>
                <SelectItem value="new">New Users</SelectItem>
                <SelectItem value="churned">Churned Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTimeFilterBlock = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Time Filter</CardTitle>
        <CardDescription>Define the time period for user activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <Button variant="outline" className="h-16 flex flex-col">
            <span className="font-semibold">Last Day</span>
            <span className="text-sm text-gray-500">24 hours</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col">
            <span className="font-semibold">Last 7 Days</span>
            <span className="text-sm text-gray-500">1 week</span>
          </Button>
          <Button variant="outline" className="h-16 flex flex-col">
            <span className="font-semibold">Last 30 Days</span>
            <span className="text-sm text-gray-500">1 month</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-blue-900">Create Audience</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Estimated Size</p>
                <p className="text-lg font-semibold text-blue-900">
                  {isCalculating ? 'Calculating...' : audienceSize.toLocaleString()}
                </p>
              </div>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Save Audience
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Audience Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Audience Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter audience name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Describe this audience"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configuration Blocks */}
            <Tabs defaultValue="profiles" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="interactions">Interactions</TabsTrigger>
                <TabsTrigger value="timefilter">Time Filter</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profiles">
                {renderProfilesBlock()}
              </TabsContent>
              
              <TabsContent value="interactions">
                {renderInteractionsBlock()}
              </TabsContent>
              
              <TabsContent value="timefilter">
                {renderTimeFilterBlock()}
              </TabsContent>
            </Tabs>

            {/* Logic Builder */}
            <Card>
              <CardHeader>
                <CardTitle>Logic Builder</CardTitle>
                <CardDescription>Combine criteria with AND/OR logic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {criteria.map((criterion, index) => (
                    <div key={criterion.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      {index > 0 && (
                        <Select
                          value={criterion.operator}
                          onValueChange={(value) => updateCriteria(criterion.id, 'operator', value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Badge variant="outline">{criterion.type}</Badge>
                      <div className="flex-1">Criteria configuration...</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(criterion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => addCriteria('profile')}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Profile Rule
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => addCriteria('interaction')}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Interaction Rule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Live Charts */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Live Audience Insights
                </CardTitle>
                <CardDescription>
                  Real-time charts update as you modify criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AudienceCharts audienceSize={audienceSize} isLoading={isCalculating} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AudienceBuilder;
