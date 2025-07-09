import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  const base64 = image.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const filename = `foto_${Date.now()}.png`;

  const { error, data } = await supabase.storage
    .from('uploads')
    .upload(filename, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const { data: publicUrl } = supabase.storage
    .from('uploads')
    .getPublicUrl(filename);

  return res.status(200).json({ message: 'Upload berhasil', url: publicUrl.publicUrl });
}
