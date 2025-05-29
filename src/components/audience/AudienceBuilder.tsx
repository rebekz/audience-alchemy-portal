
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AudienceCharts from '@/components/audience/AudienceCharts';
import AudienceRules from '@/components/audience/AudienceRules';

interface AudienceBuilderProps {
  onSave: (audienceData: any) => void;
  onCancel: () => void;
}

const AudienceBuilder = ({ onSave, onCancel }: AudienceBuilderProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<any[]>([]);
  const [audienceSize, setAudienceSize] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const calculateAudienceSize = async () => {
    setIsCalculating(true);
    // Simulate API call for audience sizing
    await new Promise(resolve => setTimeout(resolve, 1000));
    const baseSize = 100000;
    const reductionFactor = rules.length * 0.3;
    const newSize = Math.max(1000, Math.floor(baseSize * (1 - reductionFactor) + Math.random() * 20000));
    setAudienceSize(newSize);
    setIsCalculating(false);
  };

  useEffect(() => {
    if (rules.length > 0) {
      calculateAudienceSize();
    } else {
      setAudienceSize(0);
    }
  }, [rules]);

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

            {/* Audience Rules */}
            <AudienceRules rules={rules} onRulesChange={setRules} />
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
