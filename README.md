# 📄 Invoi - Invoice Management System

**Invoi** adalah aplikasi manajemen invoice mandiri (self-hosted) yang dirancang untuk freelancer, UMKM, dan kontraktor. Dibuat dengan fokus pada kesederhanaan, kecepatan, dan privasi data menggunakan penyimpanan lokal.

---

## 🚀 Fitur Utama

- **Profil Bisnis**: Kelola identitas bisnis, NPWP, dan multi-rekening bank.
- **Manajemen Klien**: Database klien terpusat untuk mempercepat pembuatan invoice.
- **Invoice Builder Canggih**: Layout *split-view* dengan live preview real-time.
- **Perpajakan & Diskon**: Dukungan PPN (11%), PPh 23, dan diskon per item.
- **Status Tracking**: Pantau siklus hidup invoice (Draft → Sent → Partially Paid → Paid → Overdue).
- **Dashboard Finansial**: Visualisasi total tagihan, pembayaran diterima, dan piutang tertunda.
- **Export & Laporan**: Export laporan bulanan ke CSV dan cetak invoice ke PDF via browser.

---

## 🖼️ Screenshot

<table>
  <tr>
    <td align="center"><strong>Dashboard</strong></td>
    <td align="center"><strong>Invoice Editor</strong></td>
  </tr>
  <tr>
    <td><img src="screenshoot/dashboard.png" alt="Dashboard Invoi" width="100%"></td>
    <td><img src="screenshoot/invoice_editor.png" alt="Invoice Editor Invoi" width="100%"></td>
  </tr>
</table>

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)
- **Database & ORM**: [SQLite](https://sqlite.org/) + [Prisma ORM](https://www.prisma.io/)
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Fonts**: Manrope (via `next/font`)

---

## 💻 Cara Menjalankan Secara Lokal

### Prasyarat
- Node.js versi 20.x atau lebih baru.
- npm atau yarn.

### Langkah-langkah
1. **Clone & Masuk ke Direktori**
   ```bash
   git clone https://github.com/issmileee/invoi.git
   cd invoi
   ```

2. **Instal Dependensi**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Setup Environment**
   Buat file environment dari template:
   ```bash
   cp .env.example .env
   ```

4. **Setup Database**
   Inisialisasi schema database Prisma ke SQLite lokal:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Build Production (Opsional, untuk verifikasi)**
   ```bash
   npm run build
   ```

6. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Aplikasi akan tersedia di [http://localhost:3000](http://localhost:3000).

---

## 🐳 Menjalankan Menggunakan Docker

Metode ini sangat disarankan untuk penggunaan production karena data akan tersimpan dengan aman di dalam volume Docker.

### Prasyarat
- [Docker](https://www.docker.com/) dan [Docker Compose](https://docs.docker.com/compose/) sudah terinstal.

### Langkah-langkah

1. **Build dan Jalankan Container**
   Pastikan Docker sudah aktif, lalu jalankan:
   ```bash
   docker-compose up -d --build
   ```
   Container akan otomatis menjalankan migrasi database (`prisma db push`) sebelum aplikasi dimulai.

2. **Akses Aplikasi**
   Buka [http://localhost:3030](http://localhost:3030) di browser Anda.
   > **Catatan:** Port yang digunakan adalah **3030** (bukan 3000).

3. **Konfigurasi Default**
   | Parameter | Nilai Default |
   |---|---|
   | Port | `3030` |
   | `ADMIN_PASSWORD` | `admin12345` |
   | `DATABASE_URL` | `file:/app/data/prod.db` |

   Untuk mengubah password atau konfigurasi lain, edit variabel `environment` pada file `docker-compose.yml` sebelum build.

4. **Menghentikan Layanan**
   ```bash
   docker-compose down
   ```

5. **Menghapus Data (Reset)**
   ```bash
   docker-compose down -v
   ```
   > **Peringatan:** Flag `-v` akan menghapus volume `db_data` beserta seluruh data database.

---

## 📂 Struktur Project

- `app/` - Routing dan komponen halaman (Next.js App Router).
- `components/` - Komponen UI yang dapat digunakan kembali.
- `prisma/` - Definisi schema database (`schema.prisma`) dan file database SQLite.
- `public/` - Aset statis seperti gambar dan font.
- `lib/` - Utilitas fungsi dan konfigurasi database.

---

---

## 📝 Catatan Penting
Pada penggunaan pertama kali, sistem akan mengarahkan Anda ke halaman **/onboarding**. Pastikan Anda mengisi profil bisnis dan pengaturan bank agar data tersebut muncul secara otomatis di setiap invoice yang Anda buat.

---
*Dibuat dengan ❤️ untuk efisiensi bisnis Anda.*
