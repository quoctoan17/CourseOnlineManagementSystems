// Custom Hooks for API Integration
// File: src/hooks/index.ts

import { useState, useCallback } from 'react';

/**
 * Hook for handling paginated data
 * Usage:
 *   const { data, page, totalPages, loading, error, goToPage, setTotalPages } = usePaginatedApi(
 *     (page) => courseService.getAll(page, 12)
 *   );
 */
export function usePaginatedApi<T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; totalPages: number }>
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn(pageNum, 12);
      setData(response.data);
      setTotalPages(response.totalPages);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetch(newPage);
    }
  };

  // Initial load
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    fetch(1);
    setInitialized(true);
  }

  return {
    data,
    page,
    totalPages,
    loading,
    error,
    goToPage,
    setTotalPages,
  };
}

/**
 * Hook for simple API calls with loading/error state
 * Usage:
 *   const { data, loading, error, execute } = useApi(
 *     () => courseService.getById(courseId)
 *   );
 */
export function useApi<T>(
  fetchFn: () => Promise<any>,
  immediate = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn();
      setData(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  // Auto-fetch on mount if immediate = true
  const [initialized, setInitialized] = useState(false);
  if (immediate && !initialized) {
    execute();
    setInitialized(true);
  }

  return { data, loading, error, execute };
}

/**
 * Hook for form submission with API
 * Usage:
 *   const { values, handleChange, handleSubmit, loading, error } = useFormSubmit(
 *     { email: '', password: '' },
 *     (values) => authService.login(values.email, values.password)
 *   );
 */
export function useFormSubmit<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<any>
) {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setValues(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await onSubmit(values);
      setSuccess(true);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setError(null);
    setSuccess(false);
  };

  return {
    values,
    setValues,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
    reset,
  };
}

/**
 * Hook for managing API request state
 * Usage:
 *   const { execute, loading, error, data } = useAsync(
 *     (id) => courseService.getById(id)
 *   );
 */
export function useAsync<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<any>,
  immediate = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);

      try {
        const response = await asyncFunction(...args);
        setData(response.data);
        return response.data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return { execute, loading, error, data };
}

/**
 * Hook for debounced search API calls
 * Usage:
 *   const { results, loading, query, setQuery } = useSearchApi(
 *     (q) => courseService.search(q)
 *   );
 */
export function useSearchApi<T>(
  searchFn: (query: string) => Promise<any>,
  debounceMs = 500
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  const timeoutId = useCallback(async () => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchFn(query);
      setResults(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, searchFn]);

  // Set up debounce
  const [timeoutHandle, setTimeoutHandle] = useState<NodeJS.Timeout | null>(null);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);

    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }

    const handle = setTimeout(timeoutId, debounceMs);
    setTimeoutHandle(handle);
  };

  return {
    query,
    setQuery: handleQueryChange,
    results,
    loading,
    error,
  };
}

/**
 * Hook for infinite scroll pagination
 * Usage:
 *   const { items, loading, hasMore, loadMore } = useInfiniteApi(
 *     (page) => courseService.getAll(page, 12)
 *   );
 */
export function useInfiniteApi<T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; totalPages: number }>
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn(page + 1, 12);
      setItems(prev => [...prev, ...response.data]);
      setPage(prev => prev + 1);
      setTotalPages(response.totalPages);
      setHasMore(page + 1 < response.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchFn]);

  // Initial load
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    const initLoad = async () => {
      setLoading(true);
      try {
        const response = await fetchFn(1, 12);
        setItems(response.data);
        setTotalPages(response.totalPages);
        setHasMore(1 < response.totalPages);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    initLoad();
  }

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
  };
}

/**
 * Hook for managing list operations (add, update, delete)
 * Usage:
 *   const { items, addItem, updateItem, deleteItem, loading } = useList(initialItems);
 */
export function useList<T extends { id: string | number }>(initialItems: T[] = []) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);

  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const updateItem = useCallback((id: string | number, updatedItem: Partial<T>) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updatedItem } : item))
    );
  }, []);

  const deleteItem = useCallback((id: string | number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const findItem = useCallback((id: string | number) => {
    return items.find(item => item.id === id);
  }, [items]);

  return {
    items,
    setItems,
    addItem,
    updateItem,
    deleteItem,
    findItem,
    loading,
    setLoading,
  };
}

/**
 * Hook for handling API errors with fallback
 * Usage:
 *   const { error, showError, clearError } = useErrorHandler();
 */
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
  };

  const clearError = () => {
    setError(null);
  };

  const handleApiError = (err: any) => {
    if (err.response?.status === 401) {
      showError('Bạn cần đăng nhập lại');
    } else if (err.response?.status === 403) {
      showError('Bạn không có quyền truy cập');
    } else if (err.response?.status === 404) {
      showError('Tài nguyên không tìm thấy');
    } else {
      showError(err.message || 'Đã xảy ra lỗi');
    }
  };

  return { error, showError, clearError, handleApiError };
}

/**
 * Hook for managing loading states
 * Usage:
 *   const { isLoading, setLoading, withLoading } = useLoading();
 *   const result = await withLoading(() => myAsyncFunction());
 */
export function useLoading(initialState = false) {
  const [isLoading, setLoading] = useState(initialState);

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setLoading(true);
      try {
        return await fn();
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { isLoading, setLoading, withLoading };
}

/**
 * Hook for managing data with cache
 * Usage:
 *   const { data, loading, error, refetch } = useCachedApi(
 *     'courseList',
 *     () => courseService.getAll(1, 50),
 *     60000 // 1 minute cache
 *   );
 */
export function useCachedApi<T>(
  cacheKey: string,
  fetchFn: () => Promise<any>,
  ttl = 300000 // 5 minutes
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    // Check cache first
    const cached = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(`${cacheKey}_time`);

    if (cached && cachedTime && Date.now() - parseInt(cachedTime) < ttl) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn();
      setData(response.data);

      // Store in cache
      sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
      sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchFn, ttl]);

  // Initial load
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    refetch();
    setInitialized(true);
  }

  return { data, loading, error, refetch };
}

export default {
  usePaginatedApi,
  useApi,
  useFormSubmit,
  useAsync,
  useSearchApi,
  useInfiniteApi,
  useList,
  useErrorHandler,
  useLoading,
  useCachedApi,
};
