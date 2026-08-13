import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.pdf', '.docx', '.xlsx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Harap upload Gambar (JPG/PNG/WEBP), Video (MP4), atau Dokumen (PDF).'));
    }
  },
});

const router = express.Router();

router.use(verifyToken);

/**
 * POST /api/media/upload
 */
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diunggah.',
      });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    const isVideo = ext === '.mp4';
    const mediaType = isImage ? 'image' : isVideo ? 'video' : 'document';
    
    // Absolute local file path or public URL
    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    const localFilePath = path.resolve(UPLOADS_DIR, req.file.filename);

    return res.json({
      success: true,
      message: 'File berhasil diunggah.',
      data: {
        fileUrl,
        localFilePath,
        fileName: req.file.originalname,
        storedName: req.file.filename,
        mediaType,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengunggah file.',
      error: error.message,
    });
  }
});

export default router;
