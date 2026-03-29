// hooks/useYoutubeInfo.ts
import { useState, useCallback } from 'react';
import api from '@/services/api';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';


export interface YoutubeInfo {
  title: string;
  duration_seconds: number;
  videoId: string;
}

export function parseYoutubeId(url: string): string | null {
  console.log('[YT] parsing url:', url);  // thêm dòng này
  try {
    const u = new URL(url);
    console.log('[YT] hostname:', u.hostname, 'pathname:', u.pathname);
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0];
      console.log('[YT] parsed id:', id);
      if (id) return id;
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const m = u.pathname.match(/\/embed\/([^/?]+)/);
      if (m) return m[1];
    }
  } catch (e) {
    console.log('[YT] parse error:', e);
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

export function useYoutubeInfo() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

const fetchInfo = useCallback(async (url: string): Promise<YoutubeInfo | null> => {
  setError(null);
  const videoId = parseYoutubeId(url);
  if (!videoId) {
    setError('URL YouTube không hợp lệ');
    return null;
  }
  setLoading(true);
  try {
    const token = localStorage.getItem('token') || '';
    const res = await fetch(
      `${API_BASE}/youtube/video-info?videoId=${videoId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi');
    return data as YoutubeInfo;
  } catch (err: any) {
    setError(err.message || 'Không lấy được thông tin video');
    return null;
  } finally {
    setLoading(false);
  }
}, []);

  return { fetchInfo, loading, error };
}