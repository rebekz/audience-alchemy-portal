import api from './api';

export interface Segment {
  name: string;
  type: 'universe' | 'exclude';
  filters: any;
}

export interface CreateAudienceRequest {
  name: string;
  description: string;
  segments: Segment[];
  created_by?: string;
}

export interface UpdateAudienceRequest {
  name: string;
  description: string;
  segments: Segment[];
  updated_by?: string;
}

export interface AudienceVersion {
  id: string;
  audience_id: string;
  version_number: number;
  name: string;
  description: string;
  segments: Segment[];
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export interface Audience {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  latest_version?: AudienceVersion;
}

export interface AudienceDetails {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  organization?: {
    id: string;
    name: string;
    description: string;
  };
  latest_version?: AudienceVersion;
}

export interface GenerationStats {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  totalUsersGenerated: number;
  averageGenerationTime: number;
  lastGenerationDate: string | null;
}

export interface GenerationJob {
  jobId: string;
  audienceId: string;
  audienceName: string;
  versionNumber: number;
  organizationId: string;
  organizationName: string;
  status: 'INITIATED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdBy: string;
  startedAt: string;
  completedAt?: string;
  recordsProcessed?: number;
  bigqueryTableName?: string;
  errorMessage?: string;
}

class AudienceService {
  // Create a new audience
  async createAudience(data: CreateAudienceRequest): Promise<Audience> {
    const response = await api.post('/audiences', data);
    return response.data;
  }

  // Get all audiences with pagination
  async getAllAudiences(page = 0, size = 20): Promise<Audience[]> {
    const response = await api.get('/audiences', {
      params: { page, size },
    });
    return response.data;
  }

  // Get specific audience details
  async getAudienceDetails(audienceId: string): Promise<AudienceDetails> {
    const response = await api.get(`/audiences/${audienceId}/details`);
    return response.data;
  }

  // Get comprehensive audience details
  async getComprehensiveDetails(audienceId: string): Promise<any> {
    const response = await api.get(`/audiences/${audienceId}/comprehensive-details`);
    return response.data;
  }

  // Update audience (creates new version)
  async updateAudience(audienceId: string, data: UpdateAudienceRequest): Promise<AudienceVersion> {
    const response = await api.put(`/audiences/${audienceId}`, data);
    return response.data;
  }

  // Delete audience
  async deleteAudience(audienceId: string): Promise<void> {
    await api.delete(`/audiences/${audienceId}`);
  }

  // Generate user IDs for audience
  async generateUserIds(audienceId: string, data: {
    versionNumber?: number;
    description?: string;
    includeAllSegments?: boolean;
    segmentIds?: string[];
    metadata?: any;
  }): Promise<GenerationJob> {
    const response = await api.post(`/audiences/${audienceId}/generations`, {
      audienceId,
      ...data,
    });
    return response.data;
  }

  // Check generation job status
  async getGenerationJobStatus(jobId: string): Promise<GenerationJob> {
    const response = await api.get(`/audience/generate-user-ids/${jobId}/status`);
    return response.data;
  }

  // Get generation history for audience
  async getGenerationHistory(audienceId: string): Promise<any[]> {
    const response = await api.get(`/audience/generate-user-ids/history/audience/${audienceId}`);
    return response.data;
  }

  // Get generation statistics
  async getGenerationStats(audienceId: string): Promise<GenerationStats> {
    const response = await api.get(`/audience/generate-user-ids/history/audience/${audienceId}/stats`);
    return response.data;
  }

  // Query BigQuery by audience ID
  async queryByAudienceId(data: {
    audienceId: string;
    versionNumber?: number;
    measures: string[];
    dimensions?: string[];
    limit?: number;
    order?: {
      field: string;
      direction: 'asc' | 'desc';
    };
  }): Promise<any> {
    const response = await api.post('/audience/query-by-id', data);
    return response.data;
  }

  // Query analytics for audience size estimation
  async queryAnalytics(data: {
    measures: string[];
    dimensions?: string[];
    filters: any[];
    limit?: number;
    order?: any;
  }): Promise<any> {
    const response = await api.post('/audiences/analytics/query', data);
    return response.data;
  }
}

export default new AudienceService();