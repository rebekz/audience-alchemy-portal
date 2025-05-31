
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Users, Filter } from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  type: 'include' | 'exclude';
  rules: any[];
}

interface AudienceSegmentsProps {
  segments: Segment[];
  onSegmentsChange: (segments: Segment[]) => void;
}

const AudienceSegments = ({ segments, onSegmentsChange }: AudienceSegmentsProps) => {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const addSegment = (type: 'include' | 'exclude') => {
    const newSegment: Segment = {
      id: Date.now().toString(),
      name: `${type === 'include' ? 'Include' : 'Exclude'} Segment ${segments.length + 1}`,
      type,
      rules: []
    };
    onSegmentsChange([...segments, newSegment]);
    setActiveSegment(newSegment.id);
  };

  const removeSegment = (id: string) => {
    onSegmentsChange(segments.filter(segment => segment.id !== id));
    if (activeSegment === id) {
      setActiveSegment(null);
    }
  };

  const updateSegment = (id: string, field: string, value: any) => {
    onSegmentsChange(segments.map(segment => 
      segment.id === id ? { ...segment, [field]: value } : segment
    ));
  };

  const addRuleToSegment = (segmentId: string, ruleType: string) => {
    const newRule = {
      id: Date.now().toString(),
      type: ruleType,
      field: '',
      operator: 'AND',
      value: ''
    };
    
    onSegmentsChange(segments.map(segment => 
      segment.id === segmentId 
        ? { ...segment, rules: [...segment.rules, newRule] }
        : segment
    ));
  };

  const updateRule = (segmentId: string, ruleId: string, field: string, value: any) => {
    onSegmentsChange(segments.map(segment => 
      segment.id === segmentId 
        ? {
            ...segment,
            rules: segment.rules.map(rule => 
              rule.id === ruleId ? { ...rule, [field]: value } : rule
            )
          }
        : segment
    ));
  };

  const removeRule = (segmentId: string, ruleId: string) => {
    onSegmentsChange(segments.map(segment => 
      segment.id === segmentId 
        ? { ...segment, rules: segment.rules.filter(rule => rule.id !== ruleId) }
        : segment
    ));
  };

  const renderRule = (rule: any, segmentId: string, index: number) => {
    return (
      <Card key={rule.id} className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                {rule.type}
              </span>
              {index > 0 && (
                <Select
                  value={rule.operator}
                  onValueChange={(value) => updateRule(segmentId, rule.id, 'operator', value)}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeRule(segmentId, rule.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {rule.type === 'Age' && (
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Age Group</Label>
              <Select
                value={rule.value}
                onValueChange={(value) => updateRule(segmentId, rule.id, 'value', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age group..." />
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
          )}

          {rule.type === 'Gender' && (
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Gender</Label>
              <Select
                value={rule.value}
                onValueChange={(value) => updateRule(segmentId, rule.id, 'value', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {rule.type === 'Interest Interaction' && (
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Interest</Label>
                <Select
                  value={rule.value}
                  onValueChange={(value) => updateRule(segmentId, rule.id, 'value', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interest..." />
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
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Time Period</Label>
                <Select
                  value={rule.field}
                  onValueChange={(value) => updateRule(segmentId, rule.id, 'field', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Last 30 days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1day">Last 1 day</SelectItem>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Audience Segments</h2>
        <p className="text-gray-600 mb-6">
          Create segments to include or exclude specific groups from your audience universe.
        </p>
        
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => addSegment('include')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add Include Segment
          </Button>
          <Button
            onClick={() => addSegment('exclude')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Add Exclude Segment
          </Button>
        </div>
      </div>

      {segments.length > 0 && (
        <Tabs value={activeSegment || segments[0]?.id} onValueChange={setActiveSegment}>
          <TabsList className="grid w-full grid-cols-auto">
            {segments.map((segment) => (
              <TabsTrigger key={segment.id} value={segment.id} className="flex items-center gap-2">
                <Badge 
                  variant={segment.type === 'include' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {segment.type}
                </Badge>
                {segment.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {segments.map((segment) => (
            <TabsContent key={segment.id} value={segment.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Segment Configuration
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSegment(segment.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`segment-name-${segment.id}`}>Segment Name</Label>
                    <Input
                      id={`segment-name-${segment.id}`}
                      placeholder="Enter segment name"
                      value={segment.name}
                      onChange={(e) => updateSegment(segment.id, 'name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Segment Type</Label>
                    <Select
                      value={segment.type}
                      onValueChange={(value) => updateSegment(segment.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="include">Include - Add users matching these criteria</SelectItem>
                        <SelectItem value="exclude">Exclude - Remove users matching these criteria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Segment Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {segment.rules.map((rule, index) => renderRule(rule, segment.id, index))}
                    
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => addRuleToSegment(segment.id, 'Age')}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Age Rule
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => addRuleToSegment(segment.id, 'Gender')}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Gender Rule
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => addRuleToSegment(segment.id, 'Interest Interaction')}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Interest Rule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {segments.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No segments created</h3>
          <p className="text-gray-600 mb-4">
            Create include or exclude segments to refine your audience targeting.
          </p>
        </Card>
      )}
    </div>
  );
};

export default AudienceSegments;
