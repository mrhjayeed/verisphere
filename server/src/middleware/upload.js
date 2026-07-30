import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Multer with memory storage (10MB limit)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Upload file to Supabase Storage or local fallback
export async function uploadToStorage(buffer, originalName) {
  const ext = path.extname(originalName);
  const randomName = `${crypto.randomUUID()}${ext}`;

  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  // If Supabase is configured, use it
  if (process.env.SUPABASE_URL && supabaseKey) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      supabaseKey
    );

    const { data, error } = await supabase.storage
      .from('verisphere-uploads')
      .upload(randomName, buffer, {
        contentType: getMimeType(ext),
        upsert: false,
      });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data: urlData } = supabase.storage
      .from('verisphere-uploads')
      .getPublicUrl(randomName);

    return urlData.publicUrl;
  }

  // Local fallback
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, randomName);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${randomName}`;
}

function getMimeType(ext) {
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}
