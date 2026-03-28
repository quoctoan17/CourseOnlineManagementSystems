# Online Course Management System

Fullstack web application for managing online courses.

## Tech Stack

Frontend:
- React
- Vite
- TailwindCSS

Backend:
- Node.js
- Express
- PostgreSQL

## Features

- Authentication
- Course management
- Role-based access (Admin / Instructor / Student)
- Upload course content

## Run project

Backend
cd Backend
npm install
npm run dev

Frontend
cd Frontend
npm install
npm run dev

## Run project with cloudflare tunnel
C:\cloudflared\cloudflared.exe tunnel --url http://localhost:3000 --> Backend
C:\cloudflared\cloudflared.exe tunnel --url http://localhost:5173 --> Frontend

## Workflow demo
1. npm run dev — BE
2. npm run dev — FE
3. Tunnel BE → copy URL → dán vào .env Frontend
4. Tunnel FE → copy URL → dán vào .env Backend
5. Restart BE + FE
6. Share link FE tunnel cho người xem