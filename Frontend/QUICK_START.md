# 🚀 Frontend Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Create Environment File
```bash
cd Frontend
cp .env.example .env
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Frontend Server
```bash
npm run dev
# Open http://localhost:5173
```

### Step 4: Make Sure Backend is Running
```bash
# In another terminal
cd Backend
npm run dev
# Should be running on http://localhost:3000
```

---

## 📁 What Was Created For You

### 🔧 **Infrastructure Files** (Ready to use, no changes needed)

1. **`src/services/api.ts`** (500+ lines)
   - Complete API service with 55+ endpoints
   - Automatic JWT token handling
   - Error handling and 401 redirect
   - No configuration needed

2. **`src/context/AuthContext.tsx`** (150 lines)
   - User authentication state management
   - Login/logout/register functions
   - Role checking helpers
   - Token persistence

3. **`src/components/ProtectedRoute.tsx`** (50 lines)
   - Route protection based on auth
   - Optional role-based access control
   - Used to wrap protected routes

4. **`src/hooks/index.ts`** (600+ lines)
   - 10 custom React hooks
   - Ready for pagination, forms, API calls
   - Reusable across all pages

### 📚 **Documentation Files** (Reference when implementing)

1. **`FRONTEND_INTEGRATION_GUIDE.md`** (1000+ lines)
   - Complete integration guide with examples
   - Best practices and patterns
   - Troubleshooting section

2. **`IMPLEMENTATION_SUMMARY.md`** (500 lines)
   - Overview of what was created
   - Testing checklist
   - Next steps and security tips

3. **`integration-examples.ts`** (500+ lines)
   - Code examples for all page types
   - Common patterns and utilities

4. **`CourseListPage.example.tsx`** (Complete working page)
   - Production-ready example
   - Shows best practices
   - Copy and adapt for other pages

### ⚙️ **Updated Files**

- `src/app/App.tsx` - AuthProvider + ProtectedRoute integration
- `src/app/pages/LoginPage.tsx` - API integration + error handling
- `src/app/pages/RegisterPage.tsx` - API integration + validation
- `.env.example` - Environment configuration template

---

## 🎯 What To Do Next

### **Option 1: Quick Test (5 minutes)**
Just test if the infrastructure works:
```typescript
// In any component
import { courseService } from '@/services/api';

// Try calling an endpoint
const courses = await courseService.getAll(1, 10);
console.log(courses);
```

### **Option 2: Update One Page (30 minutes)**
Follow the example to update one page:
1. Read: `src/app/pages/CourseListPage.example.tsx`
2. Copy pattern to actual page
3. Test in browser

### **Option 3: Update All Pages (2-3 hours)**
Complete implementation:
1. Follow `FRONTEND_INTEGRATION_GUIDE.md`
2. Update each page following examples
3. Test complete flow
4. Run full testing checklist

---

## 📋 Updated Pages (Ready to use as-is)

```
✅ LoginPage.tsx       - API integrated, error handling
✅ RegisterPage.tsx    - API integrated, validation
⏳ HomePage.tsx        - NEEDS UPDATE
⏳ CourseListPage.tsx  - NEEDS UPDATE (see CourseListPage.example.tsx)
⏳ MyCoursesPage.tsx   - NEEDS UPDATE
⏳ LessonListPage.tsx  - NEEDS UPDATE
⏳ LessonDetailsPage.tsx - NEEDS UPDATE
⏳ UserProfilePage.tsx - NEEDS UPDATE
⏳ ... (other pages)
```

---

## 🔑 Key Concepts

### 1. **Authentication Context**
```typescript
import { useAuth } from '@/context/AuthContext';

const { user, login, logout, isAdmin } = useAuth();
```

### 2. **API Service**
```typescript
import { courseService, authService } from '@/services/api';

// All API calls auto-include JWT token
const courses = await courseService.getAll(1, 12);
```

### 3. **Custom Hooks**
```typescript
import { usePaginatedApi, useFormSubmit } from '@/hooks';

// Easy pagination
const { data, page, totalPages, goToPage } = usePaginatedApi(
  (p) => courseService.getAll(p, 12)
);
```

### 4. **Protected Routes**
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

<Route 
  path="/dashboard"
  element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
/>
```

---

## 🧪 Quick Test Flow

1. **Open browser**: http://localhost:5173
2. **Register** new user (email: test@example.com, password: 123456)
3. **Login** with those credentials
4. **Should see** /dashboard (protected route)
5. **Browse courses** at /courses
6. **Enroll** in a course
7. **View progress** at /my-courses
8. **Logout** - token cleared, redirects to /login

---

## 🐛 If Something Breaks

### "Cannot find module 'api'"
✅ Check file exists: `src/services/api.ts`
✅ Check import: `import { courseService } from '@/services/api'`

### "401 Unauthorized"
✅ Check localStorage: `localStorage.getItem('token')`
✅ Check backend is running on port 3000
✅ Try login again

### "API returns invalid data"
✅ Check API response format in Browser DevTools → Network
✅ Compare with API_DOCUMENTATION.md
✅ Check backend logs

### Styles not applied
✅ Make sure using Tailwind classes
✅ Check if parent has `className` prop
✅ Clear browser cache (Ctrl+Shift+Delete)

---

## 📊 File Structure

```
Frontend/
├── src/
│   ├── services/
│   │   └── api.ts                       ✨ NEW - API service layer
│   ├── context/
│   │   └── AuthContext.tsx              ✨ NEW - Auth state management
│   ├── components/
│   │   ├── ProtectedRoute.tsx           ✨ NEW - Route protection
│   │   ├── Layout.tsx                   (existing)
│   │   └── Navigation.tsx               (existing)
│   ├── hooks/
│   │   └── index.ts                     ✨ NEW - Custom hooks
│   ├── app/
│   │   ├── App.tsx                      ✨ UPDATED - AuthProvider
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx            ✨ UPDATED - API integrated
│   │   │   ├── RegisterPage.tsx         ✨ UPDATED - API integrated
│   │   │   ├── CourseListPage.tsx       (needs update)
│   │   │   ├── CourseListPage.example.tsx  ✨ NEW - Reference example
│   │   │   └── ... (other pages)
│   │   └── components/
│   └── styles/
├── .env.example                         ✨ NEW - Environment template
├── .env                                 (create from .env.example)
├── FRONTEND_INTEGRATION_GUIDE.md        ✨ NEW - Complete guide
├── IMPLEMENTATION_SUMMARY.md            ✨ NEW - Summary + checklist
├── integration-examples.ts              ✨ NEW - Code examples
├── vite.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 💡 Implementation Strategy

### **Phase 1: Verify Setup (5 min)**
- [ ] npm install succeeds
- [ ] npm run dev starts
- [ ] Can visit http://localhost:5173

### **Phase 2: Test Authentication (10 min)**
- [ ] RegisterPage works
- [ ] LoginPage works
- [ ] Token saved to localStorage
- [ ] Protected routes work
- [ ] Logout clears token

### **Phase 3: Update One Page (30 min)**
- [ ] Copy CourseListPage.example.tsx pattern
- [ ] Update HomePage OR CourseListPage
- [ ] Test data fetching
- [ ] Test pagination

### **Phase 4: Update Remaining Pages (1-2 hours)**
- [ ] MyCoursesPage - fetch user's courses
- [ ] LessonListPage - fetch lessons
- [ ] LessonDetailsPage - mark complete
- [ ] UserProfilePage - update profile
- [ ] Admin pages - fetch reports

### **Phase 5: Full Testing (1 hour)**
- [ ] Test all endpoints work
- [ ] Test error handling
- [ ] Test pagination
- [ ] Test role-based features
- [ ] Test complete user flow

---

## 🎓 Learning Resources

### In This Project:
- `FRONTEND_INTEGRATION_GUIDE.md` - Complete reference
- `integration-examples.ts` - Code examples
- `CourseListPage.example.tsx` - Full working example
- Comments throughout code

### External:
- [React Router Docs](https://reactrouter.com/)
- [React Hooks Docs](https://react.dev/reference/react)
- [Fetch API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ Can register new user
2. ✅ Can login with email/password
3. ✅ Can view dashboard (protected route)
4. ✅ Can browse courses with pagination
5. ✅ Can enroll in course
6. ✅ Can view lessons and mark complete
7. ✅ Can view profile and update info
8. ✅ Can view admin reports (if admin)
9. ✅ Logout clears token and session
10. ✅ 401 errors redirect to login

---

## 🚀 Ready to Roll!

Everything is set up and ready to go. Just:

1. Create `.env` file
2. Run `npm install`
3. Run `npm run dev`
4. Start updating pages
5. Test the flow

**Questions?** Check:
- FRONTEND_INTEGRATION_GUIDE.md
- integration-examples.ts
- CourseListPage.example.tsx
- Check browser console (F12)
- Check Network tab to see API calls

Good luck! 🎉

---

**Last Updated:** 2026-03-04
**Status:** ✅ Ready for Implementation
**Support Level:** Complete (guides + examples + documentation)
