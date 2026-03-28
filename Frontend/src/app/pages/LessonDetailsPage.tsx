import { useState, useEffect, useRef, useCallback } from 'react';
import { Layout } from '@/app/components/Layout';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronLeft, PlayCircle, Lock } from 'lucide-react';
import { lessonService, progressService } from '@/services/api';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
  //                                                                    
  return match ? match[1] : null;
}

export default function LessonDetailsPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<any>(null);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const playerRef = useRef<any>(null);
  const lessonRef = useRef<any>(null);
  const completedIdsRef = useRef<Set<string>>(new Set());

  // Sync refs
  useEffect(() => { lessonRef.current = lesson; }, [lesson]);
  useEffect(() => { completedIdsRef.current = completedIds; }, [completedIds]);

  const isCompleted = completedIds.has(String(lessonId));
  const currentIndex = allLessons.findIndex((l: any) => String(l.id) === String(lessonId));
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const completedCount = allLessons.filter((l: any) => completedIds.has(String(l.id))).length;
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  // Bài có bị khóa không — bài đầu luôn mở, các bài sau cần bài trước hoàn thành
  const isLocked = (index: number) => {
    if (index === 0) return false;
    return !completedIds.has(String(allLessons[index - 1]?.id));
  };

  // Đánh dấu hoàn thành
  const markComplete = useCallback(async () => {
    const currentLesson = lessonRef.current;
    if (!currentLesson) return;
    const id = String(currentLesson.id);
    if (completedIdsRef.current.has(id)) return;
    try {
      await progressService.updateProgress(id, String(currentLesson.course_id));
      setCompletedIds(prev => new Set([...prev, id]));
    } catch (err) {
      console.error('markComplete error:', err);
    }
  }, []);

  // Khởi tạo YouTube Player
  const initPlayer = useCallback((videoId: string) => {
    if (!window.YT?.Player) return;
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
    }
    playerRef.current = new window.YT.Player('yt-player', {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: { rel: 0, modestbranding: 1, autoplay: 0 },
      events: {
        onStateChange: (event: any) => {
          if (event.data === 0) markComplete(); // 0 = ENDED
        },
      },
    });
  }, [markComplete]);

  // Load dữ liệu
  useEffect(() => {
    const load = async () => {
      if (!lessonId) return;
      setLoading(true);
      try {
        const res: any = await lessonService.getById(lessonId);
        const currentLesson = res.lesson || res;
        setLesson(currentLesson);

        if (currentLesson?.course_id) {
          const lessonsRes: any = await lessonService.getByCourse(String(currentLesson.course_id));
          const lessons = (lessonsRes.data || []).sort((a: any, b: any) => a.lesson_order - b.lesson_order);
          setAllLessons(lessons);

          try {
            const progressRes: any = await progressService.getStudentProgress(String(currentLesson.course_id));
            const completed = new Set<string>(
              (progressRes.lessons || [])
                .filter((l: any) => l.completed)
                .map((l: any) => String(l.id))
            );
            setCompletedIds(completed);
          } catch {}
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId]);

  // Load YouTube IFrame API một lần
  useEffect(() => {
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }, []);

  // Khởi tạo player sau khi lesson load xong
  useEffect(() => {
    if (!lesson?.video_url || loading) return;
    const videoId = getYouTubeId(lesson.video_url);
    if (!videoId) return;

    const tryInit = () => {
      if (window.YT?.Player) {
        initPlayer(videoId);
      } else {
        window.onYouTubeIframeAPIReady = () => initPlayer(videoId);
      }
    };
    const timer = setTimeout(tryInit, 400);
    return () => clearTimeout(timer);
  }, [lesson, loading, initPlayer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
          Đang tải bài học...
        </div>
      </Layout>
    );
  }

  if (error || !lesson) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-red-500">
          Lỗi: {error || 'Không tìm thấy bài học'}
        </div>
      </Layout>
    );
  }

  const hasYouTube = !!getYouTubeId(lesson.video_url);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back */}
        <Link
          to={lesson.course_id ? `/my-courses/${lesson.course_id}/lessons` : '/my-courses'}
          className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 mb-6 text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại danh sách bài học
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ===== LEFT ===== */}
          <div className="flex-1 min-w-0">
            {/* Video Player */}
            <div className="bg-gray-900 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {hasYouTube ? (
                <div id="yt-player" className="w-full h-full" />
              ) : lesson.video_url ? (
                <video
                  src={lesson.video_url}
                  controls
                  className="w-full h-full"
                  onEnded={() => markComplete()}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <PlayCircle className="h-20 w-20 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400">Video không có sẵn</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tên bài học dưới video */}
            <div className="mt-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            </div>

            {/* Điều hướng bài học */}
            <div className="flex items-center gap-3">
              {prevLesson && (
                <button
                  onClick={() => navigate(`/lessons/${prevLesson.id}`)}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Bài trước
                </button>
              )}
              {nextLesson && (
                isCompleted ? (
                  <button
                    onClick={() => navigate(`/lessons/${nextLesson.id}`)}
                    className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition"
                  >
                    Bài tiếp theo
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm cursor-not-allowed">
                    <Lock className="h-4 w-4" />
                    Xem hết video để mở khóa
                  </div>
                )
              )}
            </div>
          </div>

          {/* ===== RIGHT SIDEBAR ===== */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-6">
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1">Nội dung khóa học</h3>
                <p className="text-sm text-gray-500 mb-2">{completedCount}/{allLessons.length} bài học</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-orange-500 font-medium mt-1 text-right">
                  Tiến độ khóa học {progressPercent}%
                </p>
              </div>

              {/* Lesson List */}
              <div className="overflow-y-auto max-h-[60vh]">
                {allLessons.map((l: any, index: number) => {
                  const isCurrent = String(l.id) === String(lessonId);
                  const isDone = completedIds.has(String(l.id));
                  const locked = isLocked(index);

                  return (
                    <button
                      key={l.id}
                      disabled={locked}
                      onClick={() => !locked && navigate(`/lessons/${l.id}`)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-50 transition
                        ${isCurrent ? 'bg-orange-50 border-l-4 border-l-orange-500' : 'border-l-4 border-l-transparent'}
                        ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
                      `}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {isDone ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : locked ? (
                          <Lock className="h-5 w-5 text-gray-300" />
                        ) : (
                          <PlayCircle className={`h-5 w-5 ${isCurrent ? 'text-orange-500' : 'text-gray-400'}`} />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-400 mb-0.5">Bài {l.lesson_order}</div>
                        <div className={`text-sm font-semibold truncate ${
                          isDone ? 'text-green-600' :
                          isCurrent ? 'text-orange-500' :
                          'text-gray-700'
                        }`}>
                          {l.title}
                        </div>
                      </div>

                      {/* Duration */}
                      {l.duration && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{l.duration}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}