import api from './api';

export interface CreateSegmentRequest {
  audienceId: string;
  name: string;
  type: 'include' | 'exclude';
  filters: any;
  description?: string;
}

export interface UpdateSegmentRequest {
  name?: string;
  type?: 'include' | 'exclude';
  filters?: any;
  description?: string;
  isActive?: boolean;
}

export interface SegmentEntity {
  id: string;
  audienceId: string;
  name: string;
  type: 'include' | 'exclude';
  filters: any;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface SegmentGenerationStats {
  segmentId: string;
  segmentName: string;
  segmentType: string;
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  totalUsersGenerated: number;
  avgUsersPerGeneration: number;
  avgGenerationTimeSeconds: number;
  lastGenerationDate: string;
  successRate: number;
}

class SegmentService {
  // Create a new segment
  async createSegment(data: CreateSegmentRequest): Promise<SegmentEntity> {
    const response = await api.post('/segments', data);
    return response.data;
  }

  // Get all segments for an audience
  async getSegmentsByAudience(audienceId: string): Promise<SegmentEntity[]> {
    const response = await api.get(`/segments/audience/${audienceId}`);
    return response.data;
  }

  // Get a specific segment
  async getSegment(segmentId: string): Promise<SegmentEntity> {
    const response = await api.get(`/segments/${segmentId}`);
    return response.data;
  }

  // Update a segment
  async updateSegment(segmentId: string, data: UpdateSegmentRequest): Promise<SegmentEntity> {
    const response = await api.put(`/segments/${segmentId}`, data);
    return response.data;
  }

  // Delete a segment
  async deleteSegment(segmentId: string): Promise<void> {
    await api.delete(`/segments/${segmentId}`);
  }

  // Get segment generation statistics
  async getSegmentGenerationStats(audienceId: string, daysBack = 30): Promise<{
    segments: SegmentGenerationStats[];
    summary: {
      totalSegments: number;
      activeSegments: number;
      totalGenerations: number;
      avgGenerationsPerSegment: number;
      overallSuccessRate: number;
    };
  }> {
    const response = await api.get(`/audiences/${audienceId}/segments/generation-stats`, {
      params: { daysBack },
    });
    return response.data;
  }

  // Get generation history for a specific segment
  async getSegmentGenerationHistory(segmentId: string, limit = 50): Promise<any[]> {
    const response = await api.get(`/segments/${segmentId}/generations`, {
      params: { limit },
    });
    return response.data;
  }

  // Get latest generation result for a segment
  async getLatestGeneration(segmentId: string): Promise<any> {
    const response = await api.get(`/segments/${segmentId}/generations/latest`);
    return response.data;
  }
}

export default new SegmentService();