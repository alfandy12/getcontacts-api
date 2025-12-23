# GetContact Unofficial API

Server Node.js sederhana yang berfungsi sebagai API wrapper untuk layanan GetContact. Proyek ini menggunakan [get-contact.js](https://github.com/ilhamridho04/get-contact.js) dan Express.js untuk menyediakan HTTP API yang bisa melakukan pencarian nomor telepon setelah otentikasi satu kali melalui QR code.

## ✨ Fitur

-   **API Berbasis HTTP**: Lakukan pencarian nomor telepon melalui endpoint API yang mudah digunakan.
-   **Otentikasi via Web**: Scan QR code langsung di browser, tidak perlu melihat terminal.
-   **Sesi Persistent**: Cukup sekali scan QR code untuk penggunaan berkali-kali, berkat sistem otentikasi lokal.
-   **Mudah Dijalankan**: Cukup install dependensi dan jalankan dengan satu perintah.

---

## 📋 Prasyarat

Sebelum memulai, pastikan sistem Anda memenuhi persyaratan berikut:

1.  **Node.js**: Versi 16 ke atas direkomendasikan.
2.  **NPM**: Terinstal bersama Node.js.
3.  **Dependensi Sistem (untuk Debian/Ubuntu)**: Proyek ini menggunakan Puppeteer yang memerlukan beberapa library grafis dan font. Install dengan perintah berikut:
    ```bash
    sudo apt update
    sudo apt install -y libgbm-dev libasound2t64 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator3-1 libnss3 lsb-release xdg-utils wget
    ```

---

## 🚀 Instalasi & Deployment

Ikuti langkah-langkah berikut untuk menjalankan server di mesin Anda.

1.  **Clone Repositori**
    
    ```bash
    git clone https://github.com/alfandy12/getcontact-api.git
    ```

2.  **Masuk ke Direktori Proyek**
    ```bash
    cd getcontact-api
    ```

3.  **Install Dependensi Node.js**
    Perintah ini akan menginstal `express`, `get-contact.js`, `qrcode`, dan semua paket lain yang dibutuhkan.
    ```bash
    npm install
    ```

4.  **Jalankan Server**
    ```bash
    node index.js
    ```
    Setelah dijalankan, server akan aktif di `http://localhost:3000` dan terminal akan menampilkan log inisialisasi.

---

## ⚙️ Dokumentasi API

Server ini memiliki dua endpoint utama.

### 1. Otentikasi (`GET /`)

Endpoint ini digunakan untuk proses login awal menggunakan QR code.

-   **URL**: `http://localhost:3000/`
-   **Cara Penggunaan**:
    1.  Buka URL di atas pada browser Anda setelah server dijalankan.
    2.  Halaman akan menampilkan pesan tunggu jika QR code belum siap.
    3.  Setelah beberapa saat, sebuah **gambar QR code** akan muncul.
    4.  Buka aplikasi GetContact di HP Anda, masuk ke **Lainnya > Pengaturan > Getcontact Web**, lalu scan QR code yang ada di browser.
    5.  Setelah berhasil, halaman akan menampilkan pesan bahwa API siap digunakan.

### 2. Pencarian Nomor (`GET /search`)

Endpoint utama untuk melakukan pencarian informasi nomor telepon.

-   **URL**: `http://localhost:3000/search`
-   **Query Parameters**:
    -   `number` (wajib): Nomor telepon lengkap dengan kode negara (contoh: `6281234567890`).
    -   `country` (opsional): Kode negara 2 huruf (contoh: `ID`). Default-nya adalah `ID`.

-   **Contoh Penggunaan**:
    ```
    http://localhost:3000/search?number=6281234567890
    ```

-   **Contoh Respon Sukses (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "profile": {
          "name": "Nama Pengguna",
          "picture": "[https://link-ke-gambar.com/foto.png](https://link-ke-gambar.com/foto.png)"
        },
        "tag": {
          "count": 5,
          "list": [
            { "tag": "Tag 1" },
            { "tag": "Tag 2" }
          ]
        }
      }
    }
    ```

-   **Contoh Respon Gagal (404 Not Found)**:
    ```json
    {
        "success": false,
        "message": "Profil untuk nomor 6281234567890 tidak ditemukan."
    }
    ```

---

## ⚠️ Peringatan

-   Proyek ini adalah **wrapper tidak resmi** dan tidak berafiliasi dengan, didukung oleh, atau disponsori oleh GetContact.
-   Library yang digunakan, [get-contact.js](https://github.com/ilhamridho04/get-contact.js), dapat berhenti berfungsi kapan saja jika GetContact mengubah cara kerja antarmuka web atau API internal mereka.
-   Gunakan dengan risiko Anda sendiri. Pengembang tidak bertanggung jawab atas konsekuensi apa pun dari penggunaan aplikasi ini.
