// ---------------------------------------------------------------- //
// NAMA FILE: server.js
// DESKRIPSI: API sederhana untuk mencari nomor telepon via GetContact
// FITUR: Menyimpan sesi login agar tidak perlu scan QR berulang kali.
// ---------------------------------------------------------------- //

// 1. Impor Modul yang Diperlukan
const express = require('express');
const { GClient, GLocalAuth } = require('get-contact.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

// 2. Inisialisasi & Konfigurasi Awal
const app = express();
const PORT = process.env.PORT || 3000;

// Variabel untuk melacak status client dan data QR
let isClientReady = false;
let qrCodeDataUrl = null; // Kita akan gunakan Data URL, lebih efisien

// 3. Inisialisasi Client GetContact dengan Session Persistence
// GLocalAuth adalah kunci untuk menyimpan sesi.
// Library akan secara otomatis membuat folder .wwebjs_auth (atau sesuai clientId)
// untuk menyimpan data sesi. Saat script dijalankan lagi, sesi akan dipulihkan.
const client = new GClient({
    authStrategy: new GLocalAuth({
        clientId: 'api-getcontact-session' // Memberi nama sesi agar tidak bentrok
    }),
    // Opsi tambahan untuk Puppeteer yang bisa membantu stabilitas
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- bisa membantu di beberapa environment
            '--disable-gpu'
        ],
    }
});

console.log('[SYSTEM] Menginisialisasi GetContact Client...');

// 4. Penanganan Event dari Client GetContact
// Event ini hanya akan terpicu jika TIDAK ada sesi yang tersimpan.
client.on('qr', (qr) => {
    isClientReady = false;
    console.log('[GETCONTACT] 🔄 QR Code diterima. Silakan scan.');
    // Ubah QR string menjadi Data URL untuk ditampilkan langsung di HTML
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('[ERROR] Gagal membuat QR Code Data URL:', err);
            return;
        }
        qrCodeDataUrl = url;
        console.log(`[SYSTEM] Buka http://localhost:${PORT} di browser untuk scan QR.`);
    });
});

// Event ini terpicu saat login berhasil (baik via QR atau dari sesi yang ada)
client.on('ready', () => {
    console.log('[GETCONTACT] ✅ Client Siap! API aktif dan siap digunakan.');
    isClientReady = true;
    qrCodeDataUrl = null; // Hapus data QR karena sudah tidak diperlukan
});

// Event ini terpicu jika autentikasi dari sesi yang tersimpan gagal.
client.on('auth_failure', (msg) => {
    console.error('[GETCONTACT] ❌ AUTENTIKASI GAGAL. Sesi tidak valid.', msg);
    isClientReady = false;
    qrCodeDataUrl = null;
    
    // Hapus folder sesi yang rusak untuk memaksa pembuatan QR code baru.
    const sessionPath = './.wwebjs_auth/';
    if (fs.existsSync(sessionPath)) {
        console.log(`[SYSTEM] Menghapus folder sesi lama (${sessionPath}) untuk memulai ulang...`);
        fs.rmSync(sessionPath, { recursive: true, force: true });
    }

    // Inisialisasi ulang client agar ia memulai proses dari awal dan meminta QR code.
    console.log('[SYSTEM] Menginisialisasi ulang client untuk mendapatkan QR baru.');
    client.initialize();
});


// Event ini terpicu jika koneksi terputus
client.on('disconnected', (reason) => {
    console.log(`[GETCONTACT] ❌ Client terputus: ${reason}`);
    isClientReady = false;
    // Coba untuk re-initialize untuk menyambung kembali
    console.log('[GETCONTACT] Mencoba menghubungkan kembali...');
    client.initialize();
});

// 5. Definisi Endpoint (Routes) Express

// Endpoint utama untuk menampilkan status atau QR Code
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    
    if (isClientReady) {
        // Jika client sudah siap
        res.status(200).send(`
            <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f9f4;">
                <div style="text-align: center; padding: 40px; border-radius: 12px; background-color: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <h1 style="color: #28a745;">✅ API GetContact Siap Digunakan</h1>
                    <p style="color: #555;">Sesi Anda sudah aktif. Anda tidak perlu scan QR lagi.</p>
                    <p style="color: #777; font-size: 0.9em;">Gunakan endpoint <code>/search?number=NOMOR_TELEPON</code> untuk melakukan pencarian.</p>
                </div>
            </body>
        `);
    } else if (qrCodeDataUrl) {
        // Jika butuh scan QR
        res.status(202).send(`
            <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #fffbe6;">
                <div style="text-align: center; padding: 40px; border-radius: 12px; background-color: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <h1 style="color: #ffc107;">Scan untuk Aktivasi API</h1>
                    <p style="color: #555;">Buka aplikasi GetContact di HP Anda, lalu pindai QR code di bawah ini.</p>
                    <img src="${qrCodeDataUrl}" alt="QR Code GetContact" style="width: 280px; height: 280px; margin-top: 15px;">
                    <p style="color: #777; font-size: 0.9em; margin-top: 20px;">Halaman akan refresh otomatis setelah login berhasil.</p>
                    <script>
                        // Refresh setiap 15 detik untuk memeriksa status login
                        setInterval(() => { window.location.reload(); }, 15000);
                    </script>
                </div>
            </body>
        `);
    } else {
        // Jika client sedang inisialisasi (memulihkan sesi atau menunggu QR)
        res.status(202).send(`
            <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #eef2f7;">
                <div style="text-align: center; padding: 40px; border-radius: 12px; background-color: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <h1 style="color: #007bff;">⏳ Inisialisasi...</h1>
                    <p style="color: #555;">Sedang mencoba memulihkan sesi atau menunggu QR Code.</p>
                    <p style="color: #777; font-size: 0.9em;">Halaman akan refresh dalam 5 detik.</p>
                    <script>setTimeout(() => { window.location.reload(); }, 5000);</script>
                </div>
            </body>
        `);
    }
});

// Endpoint API untuk pencarian nomor
app.get('/search', async (req, res) => {
    if (!isClientReady) {
        return res.status(503).json({ 
            success: false, 
            message: 'Layanan belum siap. Silakan scan QR code di halaman utama jika diperlukan.' 
        });
    }

    let nomor = req.query.number;
    const negara = req.query.country || 'ID'; // Default ke Indonesia

    if (!nomor) {
        return res.status(400).json({ 
            success: false, 
            message: 'Parameter "number" wajib diisi. Contoh: /search?number=08123456789' 
        });
    }
    
    // Bersihkan nomor dari karakter non-numerik, kecuali '+' di awal.
    nomor = nomor.replace(/[^0-9+]/g, '');

    let profile = null; 
    try {
        console.log(`[API] Mencari nomor: ${nomor} di negara ${negara}`);
        profile = await client.searchNumber(negara, nomor);
        
        // **PERBAIKAN**: Buat objek baru yang bersih sebelum mengirim respons.
        // Ini untuk menghindari masalah saat JSON.stringify() objek kelas.
        const responseData = {
            name: profile.name,
            phone_number: profile.phone_number,
            provider: profile.provider,
            // Anda bisa tambahkan properti lain dari 'profile' jika ada
        };

        res.status(200).json({ 
            success: true, 
            data: responseData
        });

    } catch (error) {
        console.error('[API_ERROR] Terjadi kesalahan saat mencari nomor:', error.message);
        
        if (profile) {
            console.log('[API_WORKAROUND] Error terjadi, tetapi data profil berhasil diambil. Mengirim data...');
            
            // **PERBAIKAN**: Lakukan hal yang sama di blok catch.
            const responseData = {
                name: profile.name,
                phone_number: profile.phone_number,
                provider: profile.provider,
            };

            return res.status(200).json({
                success: true,
                note: 'Data recovered after a non-critical library error.',
                data: responseData
            });
        }

        if (error.message.includes('Cannot read properties of null')) {
             return res.status(500).json({ 
                success: false, 
                message: 'Gagal melakukan pencarian. Kemungkinan ada perubahan pada sistem GetContact. Library perlu diperbarui.',
                error: 'Internal library error'
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan internal pada server.',
            error: error.message 
        });
    }
});

// 6. Jalankan Server dan Inisialisasi Client
app.listen(PORT, () => {
    console.log(`[API] Server berjalan di http://localhost:${PORT}`);
    // Memulai proses inisialisasi client setelah server siap
    client.initialize();
});
