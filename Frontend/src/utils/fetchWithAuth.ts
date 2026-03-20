interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchWithAuth(url: string, options: FetchOptions = {}) {
  const token = localStorage.getItem('token');
  
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return res;
}