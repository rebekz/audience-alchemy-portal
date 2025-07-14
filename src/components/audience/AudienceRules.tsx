
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trash2, Plus } from 'lucide-react';

interface Rule {
  id: string;
  type: string;
  field: string;
  operator: string;
  value: string;
}

interface AudienceRulesProps {
  rules: Rule[];
  onRulesChange: (rules: Rule[]) => void;
}

const AudienceRules = ({ rules, onRulesChange }: AudienceRulesProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const addRule = (type: string) => {
    const newRule: Rule = {
      id: Date.now().toString(),
      type,
      field: '',
      operator: 'AND',
      value: ''
    };
    onRulesChange([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter(rule => rule.id !== id));
  };

  const updateRule = (id: string, field: string, value: any) => {
    onRulesChange(rules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const renderRuleCard = (rule: Rule, index: number) => {
    return (
      <Card key={rule.id} className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {rule.type}
              </span>
              {index > 0 && (
                <Select
                  value={rule.operator}
                  onValueChange={(value) => updateRule(rule.id, 'operator', value)}
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
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeRule(rule.id)}
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
                onValueChange={(value) => updateRule(rule.id, 'value', value)}
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
                onValueChange={(value) => updateRule(rule.id, 'value', value)}
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
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Interest</Label>
                <Select
                  value={rule.value}
                  onValueChange={(value) => updateRule(rule.id, 'value', value)}
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
                  onValueChange={(value) => updateRule(rule.id, 'field', value)}
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

          {rule.type === 'Application' && (
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Application</Label>
              <Select
                value={rule.value}
                onValueChange={(value) => updateRule(rule.id, 'value', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select application..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="imessage">iMessage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Audience Rules</h2>
        <p className="text-gray-600 mb-6">
          Define criteria to segment your audience. Use search to quickly find options.
        </p>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {rules.map((rule, index) => renderRuleCard(rule, index))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => addRule('Age')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Age Rule
        </Button>
        <Button
          variant="outline"
          onClick={() => addRule('Gender')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Gender Rule
        </Button>
        <Button
          variant="outline"
          onClick={() => addRule('Interest Interaction')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Interest Rule
        </Button>
        <Button
          variant="outline"
          onClick={() => addRule('Application')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Application Rule
        </Button>
      </div>
    </div>
  );
};

export default AudienceRules;
