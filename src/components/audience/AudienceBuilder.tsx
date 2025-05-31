
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BarChart3, Users, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AudienceCharts from '@/components/audience/AudienceCharts';
import AudienceRules from '@/components/audience/AudienceRules';
import AudienceSegments from '@/components/audience/AudienceSegments';

interface AudienceBuilderProps {
  onSave: (audienceData: any) => void;
  onCancel: () => void;
}

const AudienceBuilder = ({ onSave, onCancel }: AudienceBuilderProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [audienceSize, setAudienceSize] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const calculateAudienceSize = async () => {
    setIsCalculating(true);
    // Simulate API call for audience sizing
    await new Promise(resolve => setTimeout(resolve, 1000));
    const baseSize = 100000;
    const rulesReduction = rules.length * 0.3;
    const segmentsImpact = segments.reduce((acc, segment) => {
      const segmentRulesCount = segment.rules?.length || 0;
      return acc + (segment.type === 'exclude' ? segmentRulesCount * 0.2 : segmentRulesCount * 0.1);
    }, 0);
    const totalReduction = rulesReduction + segmentsImpact;
    const newSize = Math.max(1000, Math.floor(baseSize * (1 - totalReduction) + Math.random() * 20000));
    setAudienceSize(newSize);
    setIsCalculating(false);
  };

  useEffect(() => {
    if (rules.length > 0 || segments.length > 0) {
      calculateAudienceSize();
    } else {
      setAudienceSize(0);
    }
  }, [rules, segments]);

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
      rules,
      segments,
      size: audienceSize
    });

    toast({
      title: "Audience Created",
      description: `${name} has been successfully created with ${audienceSize.toLocaleString()} users`,
    });
  };

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

            {/* Tabs for Rules and Segments */}
            <Tabs defaultValue="rules" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="rules" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Base Rules
                </TabsTrigger>
                <TabsTrigger value="segments" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Segments
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="rules" className="mt-6">
                <AudienceRules rules={rules} onRulesChange={setRules} />
              </TabsContent>
              
              <TabsContent value="segments" className="mt-6">
                <AudienceSegments segments={segments} onSegmentsChange={setSegments} />
              </TabsContent>
            </Tabs>
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
                  Real-time charts update as you modify criteria and segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AudienceCharts audienceSize={audienceSize} isLoading={isCalculating} />
              </CardContent>
            </Card>

            {/* Segments Summary */}
            {segments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Segments Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {segments.map((segment) => (
                      <div key={segment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{segment.name}</p>
                          <p className="text-xs text-gray-600">{segment.rules?.length || 0} rules</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          segment.type === 'include' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {segment.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AudienceBuilder;
