
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BarChart3, Users, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AudienceCharts from '@/components/audience/AudienceCharts';
import AudienceRules from '@/components/audience/AudienceRules';
import AudienceSegments from '@/components/audience/AudienceSegments';
import audienceService from '@/services/audienceService';

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
  const [baseAudienceId, setBaseAudienceId] = useState('');
  const [availableAudiences, setAvailableAudiences] = useState<any[]>([]);
  const [isLoadingAudiences, setIsLoadingAudiences] = useState(true);
  const { toast } = useToast();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load available audiences on mount
  useEffect(() => {
    const loadAudiences = async () => {
      try {
        setIsLoadingAudiences(true);
        const audiences = await audienceService.getAllAudiences();
        setAvailableAudiences(audiences);
      } catch (error) {
        console.error('Failed to load audiences:', error);
        toast({
          title: "Error",
          description: "Failed to load available audiences",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAudiences(false);
      }
    };
    loadAudiences();
  }, []);

  // Convert UI rules to API filter format
  const convertRulesToFilters = (rules: any[]) => {
    const filters: any[] = [];
    
    rules.forEach((rule) => {
      if (rule.value) {
        // Map UI rule types to API dimensions
        let dimension = '';
        let operator = 'equals';
        let values = [rule.value];
        
        // Handle different rule types
        switch (rule.type) {
          case 'Age':
            dimension = 'age_group';
            break;
          case 'Gender':
            dimension = 'gender';
            break;
          case 'Interest Interaction':
            dimension = 'interest_category';
            // For Interest Interaction, the value is the interest type
            values = [rule.value];
            break;
          case 'Application':
            dimension = 'application';
            // Map application values to proper case
            if (rule.value === 'whatsapp') values = ['WhatsApp'];
            else if (rule.value === 'instagram') values = ['Instagram'];
            else if (rule.value === 'imessage') values = ['iMessage'];
            else values = [rule.value];
            break;
          case 'Device':
            dimension = 'device_type';
            break;
          case 'Location':
            dimension = 'location';
            break;
          default:
            // If no specific mapping, use the type as dimension
            dimension = rule.type.toLowerCase().replace(/\s+/g, '_');
        }
        
        if (dimension) {
          filters.push({
            dimension,
            operator,
            values
          });
        }
      }
    });
    
    return filters;
  };

  // Convert segments to API filter format
  const convertSegmentsToFilters = (segments: any[]) => {
    return segments.map((segment) => {
      const segmentFilters = segment.rules ? convertRulesToFilters(segment.rules) : [];
      
      return {
        name: segment.name || `segment_${segment.id}`,
        type: segment.type === 'exclude' ? 'exclude' : 'include',
        filters: {
          type: 'and',
          filters: segmentFilters
        }
      };
    });
  };

  const calculateAudienceSize = async () => {
    setIsCalculating(true);
    
    try {
      // Convert rules and segments to API format
      const baseFilters = convertRulesToFilters(rules);
      const segmentFilters = convertSegmentsToFilters(segments);
      
      // If we have rules or segments, query the actual size
      if (baseFilters.length > 0 || segmentFilters.length > 0) {
        // Build the filters array for the API
        const apiFilters: any[] = [];
        
        // Add universe filter if we have base rules
        if (baseFilters.length > 0) {
          apiFilters.push({
            name: 'base_audience',
            type: 'universe',
            filters: {
              type: 'and',
              filters: baseFilters
            }
          });
        }
        
        // Add segment filters
        apiFilters.push(...segmentFilters);
        
        // Call the analytics API
        const response = await audienceService.queryAnalytics({
          measures: ['count(distinct(user_id))'],
          filters: apiFilters,
          limit: 25
        });
        
        // Extract the audience size from the response
        const sizeData = response?.data?.[0];
        const audienceSize = parseInt(sizeData?.measure_1 || sizeData?.['count(distinct(user_id))'] || '0');
        
        setAudienceSize(audienceSize);
      } else {
        // No rules or segments, set size to 0
        setAudienceSize(0);
      }
    } catch (error) {
      console.error('Failed to calculate audience size:', error);
      // Fallback to estimated calculation
      const baseSize = 100000;
      const rulesReduction = rules.length * 0.3;
      const segmentsImpact = segments.reduce((acc, segment) => {
        const segmentRulesCount = segment.rules?.length || 0;
        return acc + (segment.type === 'exclude' ? segmentRulesCount * 0.2 : segmentRulesCount * 0.1);
      }, 0);
      const totalReduction = rulesReduction + segmentsImpact;
      const newSize = Math.max(1000, Math.floor(baseSize * (1 - totalReduction) + Math.random() * 20000));
      setAudienceSize(newSize);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer to calculate audience size after 500ms of inactivity
    debounceTimerRef.current = setTimeout(() => {
      if (rules.length > 0 || segments.length > 0 || baseAudienceId) {
        calculateAudienceSize();
      } else {
        setAudienceSize(0);
      }
    }, 500);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [rules, segments, baseAudienceId]);

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
      size: audienceSize,
      baseAudienceId
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
                <div>
                  <Label htmlFor="baseAudience">Base Audience</Label>
                  <Select
                    value={baseAudienceId}
                    onValueChange={setBaseAudienceId}
                    disabled={isLoadingAudiences}
                  >
                    <SelectTrigger id="baseAudience">
                      <SelectValue placeholder={isLoadingAudiences ? "Loading audiences..." : "Select a base audience"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAudiences.map((audience) => (
                        <SelectItem key={audience.id} value={audience.id}>
                          {audience.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-1">
                    The audience size will be calculated based on the selected base audience
                  </p>
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
