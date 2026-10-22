import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DatasetMetadata,
  PreviewResponse,
  QueryResult,
  AnalyticsDashboardResponse,
  AIInsightsResponse,
  SettingsState
} from '../types';
import { api } from '../services/api';

export type NavTab = 'overview' | 'sources' | 'studio' | 'analytics' | 'insights' | 'history' | 'saved' | 'settings';

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  datasets: DatasetMetadata[];
  currentDataset: DatasetMetadata | null;
  setCurrentDataset: (ds: DatasetMetadata) => void;
  previewData: PreviewResponse | null;
  setPreviewData: React.Dispatch<React.SetStateAction<PreviewResponse | null>>;
  currentQuery: string;
  setCurrentQuery: (q: string) => void;
  queryResult: QueryResult | null;
  setQueryResult: React.Dispatch<React.SetStateAction<QueryResult | null>>;
  queryHistory: QueryResult[];
  analysisScope: 'query_result' | 'entire_dataset';
  setAnalysisScope: (scope: 'query_result' | 'entire_dataset') => void;
  analyticsData: AnalyticsDashboardResponse | null;
  insightsData: AIInsightsResponse | null;
  settings: SettingsState | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refreshDatasets: (targetSelectId?: string) => Promise<DatasetMetadata[]>;
  selectDataset: (datasetId: string) => Promise<void>;
  clearAllDatasets: () => Promise<void>;
  runQuery: (queryText: string, deepMode?: boolean) => Promise<void>;
  triggerAnalysis: (target: 'query_result' | 'entire_dataset') => Promise<void>;
  refreshInsights: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Whenever opened, start directly on the Data Sources page ready to provide/upload a new dataset
  const [activeTab, setActiveTab] = useState<NavTab>('sources');
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [currentDataset, setCurrentDatasetState] = useState<DatasetMetadata | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('Show top 10 records by value');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [analysisScope, setAnalysisScope] = useState<'query_result' | 'entire_dataset'>('query_result');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDashboardResponse | null>(null);
  const [insightsData, setInsightsData] = useState<AIInsightsResponse | null>(null);
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const refreshDatasets = async (targetSelectId?: string): Promise<DatasetMetadata[]> => {
    try {
      setIsLoading(true);
      const list = await api.getDatasets();
      setDatasets(list);

      // Determine dataset to select
      let toSelect: DatasetMetadata | null = null;
      if (targetSelectId) {
        toSelect = list.find((d) => d.id === targetSelectId) || null;
      } else if (currentDataset) {
        toSelect = list.find((d) => d.id === currentDataset.id) || (list.length > 0 ? list[0] : null);
      } else if (list.length > 0) {
        toSelect = list[0];
      }

      if (toSelect) {
        setCurrentDatasetState(toSelect);
        try {
          const prev = await api.getPreview(toSelect.id, 5);
          setPreviewData(prev);
        } catch {
          setPreviewData(null);
        }
      } else {
        setCurrentDatasetState(null);
        setPreviewData(null);
        setQueryResult(null);
        setAnalyticsData(null);
        setInsightsData(null);
      }

      const st = await api.getSettings().catch(() => null);
      if (st) setSettings(st);

      return list;
    } catch (err: any) {
      setError(err.message || 'Failed to load datasets.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDatasets();
  }, []);

  const selectDataset = async (datasetId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      let list = datasets;
      let ds = list.find((d) => d.id === datasetId);
      if (!ds) {
        list = await api.getDatasets();
        setDatasets(list);
        ds = list.find((d) => d.id === datasetId);
      }

      if (ds) {
        setCurrentDatasetState(ds);
        const prev = await api.getPreview(ds.id, 5);
        setPreviewData(prev);

        // Reset query results associated with old dataset
        setQueryResult(null);
        setAnalyticsData(null);
        setInsightsData(null);

        // Customize default query based on dataset columns
        const numericCol = ds.columns.find((c) => c.semantic_type === 'curr' || c.semantic_type === 'num');
        if (numericCol) {
          setCurrentQuery(`Show top 10 records by ${numericCol.name}`);
        } else {
          setCurrentQuery('Show top 10 records');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error selecting dataset.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllDatasets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.clearAllDatasets();
      setDatasets([]);
      setCurrentDatasetState(null);
      setPreviewData(null);
      setQueryResult(null);
      setAnalyticsData(null);
      setInsightsData(null);
      setActiveTab('sources');
    } catch (err: any) {
      setError(err.message || 'Failed to clear datasets.');
    } finally {
      setIsLoading(false);
    }
  };

  const runQuery = async (queryText: string, deepMode: boolean = false) => {
    if (!currentDataset) {
      setError('Please select or upload a dataset first.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.executeQuery(currentDataset.id, queryText, deepMode);
      setQueryResult(res);
      setQueryHistory((prev) => [res, ...prev.slice(0, 19)]);
    } catch (err: any) {
      setError(err.message || 'Query execution failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAnalysis = async (target: 'query_result' | 'entire_dataset') => {
    if (!currentDataset) {
      setError('Please select or upload a dataset first.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      setAnalysisScope(target);
      const qId = target === 'query_result' && queryResult ? queryResult.id : undefined;
      const [analytics, insights] = await Promise.all([
        api.getAnalytics(currentDataset.id, target, qId),
        api.getInsights(currentDataset.id, target, qId),
      ]);
      setAnalyticsData(analytics);
      setInsightsData(insights);
      setActiveTab('analytics');
    } catch (err: any) {
      setError(err.message || 'Failed to run analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInsights = async () => {
    if (!currentDataset) {
      setError('Please select or upload a dataset first.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const qId = analysisScope === 'query_result' && queryResult ? queryResult.id : undefined;
      const insights = await api.getInsights(currentDataset.id, analysisScope, qId);
      setInsightsData(insights);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI insights.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        datasets,
        currentDataset,
        setCurrentDataset: setCurrentDatasetState,
        previewData,
        setPreviewData,
        currentQuery,
        setCurrentQuery,
        queryResult,
        setQueryResult,
        queryHistory,
        analysisScope,
        setAnalysisScope,
        analyticsData,
        insightsData,
        settings,
        isLoading,
        error,
        clearError,
        refreshDatasets,
        selectDataset,
        clearAllDatasets,
        runQuery,
        triggerAnalysis,
        refreshInsights,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
