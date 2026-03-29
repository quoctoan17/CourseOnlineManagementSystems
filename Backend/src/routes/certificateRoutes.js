import express from 'express';
import { getCertificate, getMyCertificates } from '../controllers/certificateController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/',                    getMyCertificates);   // GET /api/certificates
router.get('/course/:courseId',    getCertificate);      // GET /api/certificates/course/:courseId

export default router;