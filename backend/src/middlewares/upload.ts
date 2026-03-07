import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { UPLOADS_DIR } from '../config/paths';

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base}-${unique}${ext}`);
  }
});

const allowedMime = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

export const upload = multer({
  storage,
  limits: {
    files: 20,
    fileSize: 5 * 1024 * 1024 // 5MB per file
  },
  fileFilter(_req, file, cb) {
    if (!allowedMime.has(file.mimetype)) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  }
});

