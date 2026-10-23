import {
  DatasetMetadata,
  PreviewResponse,
  QueryResult,
  AnalyticsDashboardResponse,
  AIInsightsResponse,
  SettingsState
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-powered-data-analytic-assistant.onrender.com';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Cannot connect to InsightAI Backend. Ensure the FastAPI server is running on port 8000.');
      }
      throw err;
    }
  }

  async getDatasets(): Promise<DatasetMetadata[]> {
    return this.request<DatasetMetadata[]>('/api/datasets');
  }

  async uploadDataset(file: File): Promise<DatasetMetadata> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/datasets/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || 'Upload failed.');
    }

    return await response.json();
  }

  async getPreview(
    datasetId: string,
    limit: number = 100,
    offset: number = 0,
    search?: string,
    sortBy?: string,
    sortAsc: boolean = true
  ): Promise<PreviewResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      sort_asc: sortAsc.toString(),
    });
    if (search) params.append('search', search);
    if (sortBy) params.append('sort_by', sortBy);

    return this.request<PreviewResponse>(`/api/datasets/${datasetId}/preview?${params.toString()}`);
  }

  async executeQuery(datasetId: string, queryText: string, deepMode: boolean = false): Promise<QueryResult> {
    return this.request<QueryResult>(`/api/datasets/${datasetId}/query`, {
      method: 'POST',
      body: JSON.stringify({ query_text: queryText, deep_mode: deepMode }),
    });
  }

  async getAnalytics(
    datasetId: string,
    target: 'query_result' | 'entire_dataset' = 'query_result',
    queryResultId?: string
  ): Promise<AnalyticsDashboardResponse> {
    return this.request<AnalyticsDashboardResponse>(`/api/datasets/${datasetId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ target, query_result_id: queryResultId }),
    });
  }

  async getInsights(
    datasetId: string,
    target: 'query_result' | 'entire_dataset' = 'query_result',
    queryResultId?: string
  ): Promise<AIInsightsResponse> {
    return this.request<AIInsightsResponse>(`/api/datasets/${datasetId}/insights`, {
      method: 'POST',
      body: JSON.stringify({ target, query_result_id: queryResultId }),
    });
  }

  async sendCopilotMessage(datasetId: string, message: string): Promise<{ reply: string; suggested_actions: string[] }> {
    return this.request<{ reply: string; suggested_actions: string[] }>(`/api/datasets/${datasetId}/copilot`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async deleteDataset(datasetId: string): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(`/api/datasets/${datasetId}`, {
      method: 'DELETE',
    });
  }

  async clearAllDatasets(): Promise<{ status: string; message: string; cleared_count: number }> {
    return this.request<{ status: string; message: string; cleared_count: number }>('/api/datasets', {
      method: 'DELETE',
    });
  }

  async getSettings(): Promise<SettingsState> {
    return this.request<SettingsState>('/api/settings');
  }

  async updateSettings(payload: { gemini_api_key?: string; openai_api_key?: string; groq_api_key?: string; llm_provider?: string }): Promise<any> {
    return this.request('/api/settings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getExportUrl(datasetId: string, format: 'csv' | 'excel' | 'json', queryResultId?: string): string {
    const params = new URLSearchParams({ format });
    if (queryResultId) params.append('query_result_id', queryResultId);
    return `${API_BASE_URL}/api/datasets/${datasetId}/export?${params.toString()}`;
  }
}

export const api = new ApiService();
