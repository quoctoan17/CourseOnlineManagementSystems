import { Layout } from '@/app/components/Layout';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, CheckCircle, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { lessonService, progressService } from '@/services/api';

export default function LessonListPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [lessons, setLessons] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      try {
        const res: any = await lessonService.getByCourse(courseId);
        setLessons(res.data || []);
        setCourse(res.course || null);

        try {
          const progressRes: any = await progressService.getStudentProgress(courseId);
          const completed = new Set<string>(
            (progressRes.lessons || [])
              .filter((l: any) => l.completed)
              .map((l: any) => String(l.id))
          );
          setCompletedIds(completed);
        } catch {}
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/my-courses" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 text-sm">
          ← Quay lại khóa học của tôi
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {course?.title || 'Danh sách bài học'}
          </h1>
          {lessons.length > 0 && (
            <p className="text-gray-500 mt-1">{lessons.length} bài học</p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải bài học...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">Lỗi: {error}</div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Khóa học chưa có bài học nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="divide-y divide-gray-100">
              {lessons
                .sort((a: any, b: any) => a.lesson_order - b.lesson_order)
                .map((lesson: any) => {
                  const isCompleted = completedIds.has(String(lesson.id));

                  // ✅ CHECK LOCK
                  const prevLesson = lessons.find(
                    (l: any) => l.lesson_order === lesson.lesson_order - 1
                  );

                  const isLocked =
                    lesson.lesson_order !== 1 &&
                    (!prevLesson || !completedIds.has(String(prevLesson.id)));

                  return (
                    <div
                      key={lesson.id}
                      className={`flex items-center gap-4 px-6 py-4 transition ${
                        isLocked ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : isLocked ? (
                          <span className="text-gray-400 text-lg">🔒</span>
                        ) : (
                          <PlayCircle className="h-6 w-6 text-orange-600" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">
                          Bài {lesson.lesson_order}: {lesson.title}
                        </div>
                        {lesson.video_url ? (
                          <div className="text-sm text-gray-400 truncate">{lesson.video_url}</div>
                        ) : (
                          <div className="text-sm text-gray-400">Chưa có video</div>
                        )}
                      </div>

                      {/* Button */}
                      {isLocked ? (
                        <button
                          disabled
                          className="flex-shrink-0 bg-gray-300 text-gray-500 px-5 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
                        >
                          Bị khóa
                        </button>
                      ) : (
                        <Link
                          to={`/lessons/${lesson.id}`}
                          className="flex-shrink-0 bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                        >
                          {isCompleted ? 'Xem lại' : 'Học ngay'}
                        </Link>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}



// import { Layout } from '@/app/components/Layout';
// import { useParams, Link } from 'react-router-dom';
// import { PlayCircle, CheckCircle, BookOpen } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { lessonService, progressService } from '@/services/api';

// export default function LessonListPage() {
//   const { courseId } = useParams<{ courseId: string }>();
//   const [lessons, setLessons] = useState<any[]>([]);
//   const [course, setCourse] = useState<any>(null);
//   const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const load = async () => {
//       if (!courseId) return;
//       try {
//         // Lấy danh sách lessons
//         const res: any = await lessonService.getByCourse(courseId);
//         setLessons(res.data || []);
//         setCourse(res.course || null);

//         // Lấy tiến độ (nếu có) — không báo lỗi nếu thất bại
//         try {
//           const progressRes: any = await progressService.getStudentProgress(courseId);
//           const completed = new Set<string>(
//             (progressRes.lessons || [])
//               .filter((l: any) => l.completed)
//               .map((l: any) => String(l.id))
//           );
//           setCompletedIds(completed);
//         } catch {
//           // Không có progress — bỏ qua
//         }
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [courseId]);

//   return (
//     <Layout>
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Back link */}
//         <Link to="/my-courses" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 text-sm">
//           ← Quay lại khóa học của tôi
//         </Link>

//         {/* Title */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold">
//             {course?.title || 'Danh sách bài học'}
//           </h1>
//           {lessons.length > 0 && (
//             <p className="text-gray-500 mt-1">{lessons.length} bài học</p>
//           )}
//         </div>

//         {/* Content */}
//         {loading ? (
//           <div className="text-center py-12 text-gray-500">Đang tải bài học...</div>
//         ) : error ? (
//           <div className="text-center py-12 text-red-500">Lỗi: {error}</div>
//         ) : lessons.length === 0 ? (
//           <div className="text-center py-12">
//             <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500 text-lg">Khóa học chưa có bài học nào</p>
//           </div>
//         ) : (
//           <div className="bg-white rounded-xl shadow-md overflow-hidden">
//             <div className="divide-y divide-gray-100">
//               {lessons
//                 .sort((a: any, b: any) => a.lesson_order - b.lesson_order)
//                 .map((lesson: any, index: number) => {
//                   const isCompleted = completedIds.has(String(lesson.id));
//                   return (
//                     <div
//                       key={lesson.id}
//                       className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition"
//                     >
//                       {/* Order / status icon */}
//                       <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
//                         {isCompleted ? (
//                           <CheckCircle className="h-6 w-6 text-green-500" />
//                         ) : (
//                           <PlayCircle className="h-6 w-6 text-orange-600" />
//                         )}
//                       </div>

//                       {/* Lesson info */}
//                       <div className="flex-1 min-w-0">
//                         <div className="font-semibold text-gray-900">
//                           Bài {lesson.lesson_order}: {lesson.title}
//                         </div>
//                         {lesson.video_url ? (
//                           <div className="text-sm text-gray-400 truncate">{lesson.video_url}</div>
//                         ) : (
//                           <div className="text-sm text-gray-400">Chưa có video</div>
//                         )}
//                       </div>

//                       {/* Action button */}
//                       <Link
//                         to={`/lessons/${lesson.id}`}
//                         className="flex-shrink-0 bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition text-sm font-medium"
//                       >
//                         {isCompleted ? 'Xem lại' : 'Học ngay'}
//                       </Link>
//                     </div>
//                   );
//                 })}
//             </div>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }