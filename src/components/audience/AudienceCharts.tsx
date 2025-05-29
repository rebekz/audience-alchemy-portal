
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface AudienceChartsProps {
  audienceSize: number;
  isLoading: boolean;
}

const AudienceCharts = ({ audienceSize, isLoading }: AudienceChartsProps) => {
  const demographicData = [
    { name: '18-24', value: 25, color: '#3B82F6' },
    { name: '25-34', value: 35, color: '#10B981' },
    { name: '35-44', value: 25, color: '#F59E0B' },
    { name: '45+', value: 15, color: '#EF4444' }
  ];

  const appData = [
    { name: 'Mobile App', users: 60 },
    { name: 'Web Platform', users: 35 },
    { name: 'Both', users: 80 }
  ];

  const interestData = [
    { name: 'Gaming', value: 30, color: '#8B5CF6' },
    { name: 'Fashion', value: 25, color: '#EC4899' },
    { name: 'Tech', value: 20, color: '#06B6D4' },
    { name: 'Sports', value: 15, color: '#84CC16' },
    { name: 'Other', value: 10, color: '#6B7280' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (audienceSize === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Add criteria to see live audience insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demographic Mix */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Age Distribution</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={demographicData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {demographicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {demographicData.map((item) => (
            <div key={item.name} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded mr-1" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span>{item.name}: {item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* App Distribution */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">App Usage</h4>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={appData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="users" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interest Distribution */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Interest Mix</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={interestData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
              >
                {interestData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {interestData.map((item) => (
            <div key={item.name} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded mr-1" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Options */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Platform Sync</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-blue-700">
          <p>Ready to sync {audienceSize.toLocaleString()} users to:</p>
          <ul className="mt-2 space-y-1">
            <li>• Facebook Ads Manager</li>
            <li>• Google Ads</li>
            <li>• Customer Data Platform</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudienceCharts;
