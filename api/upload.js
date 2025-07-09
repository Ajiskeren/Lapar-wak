import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { image } = req.body;
  if (!image) {
    console.log("❌ Tidak ada gambar dikirim");
    return res.status(400).json({ error: 'No image provided' });
  }

  console.log("📥 Gambar diterima, memproses...");

  const base64 = image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const filename = `foto_${Date.now()}.png`;

  console.log("📤 Mengunggah ke Supabase Storage...");

  const { error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filename, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    console.log("❌ Upload gagal:", uploadError.message);
    return res.status(500).json({ error: uploadError.message });
  }

  console.log("✅ Upload berhasil:", filename);

  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(filename);

  if (!urlData?.publicUrl) {
    return res.status(500).json({ error: 'Gagal mengambil URL publik' });
  }

  console.log("🌐 URL publik:", urlData.publicUrl);

  return res.status(200).json({
    message: 'Upload berhasil',
    url: urlData.publicUrl
  });
  
console.log("SUPABASE_URL:", process.env.SUPABASE_URL?.slice(0, 20));
console.log("SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY?.slice(0, 20));

  
}
