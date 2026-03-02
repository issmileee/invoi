# Invoi

Invoice generator lokal untuk freelancer, UMKM, dan kontraktor. Dibangun dengan Next.js + Prisma + SQLite.

## Fitur
- **Profil Bisnis**: Nama, alamat, NPWP, multi rekening bank, pengaturan pajak default (PPN 11%, PPh 23%)
- **Manajemen Klien**: CRUD data klien dengan alamat lengkap
- **Invoice Builder**: Layout split 1/3 form | 2/3 live preview real-time
- **Line Items**: Deskripsi, qty, satuan, harga + diskon, PPN, PPh
- **Status Tracking**: Draft → Sent → Partially Paid → Paid → Overdue
- **Record Pembayaran**: Input pembayaran manual (nominal + tanggal)
- **Dashboard**: Total invoiced, received, pending + grafik pemasukan bulanan
- **Laporan**: Export CSV per tahun/bulan
- **Export PDF**: Print invoice via browser (Ctrl+P)

## Stack
- Next.js 14 (App Router)
- TailwindCSS + Manrope font
- Prisma ORM + SQLite
- Docker + Docker Compose

## Menjalankan Lokal
```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

Buka `http://localhost:3000`

Setup pertama: kunjungi `/onboarding` untuk mengisi profil bisnis dan rekening bank.

## Docker
```bash
cp .env.example .env
docker-compose up --build
```

## Struktur Utama
- `app/page.tsx` - Dashboard
- `app/invoices/` - Daftar invoice, buat baru, edit, detail
- `app/clients/` - Daftar klien, tambah, edit
- `app/settings/` - Profil bisnis, bank, pajak
- `app/reports/` - Laporan bulanan
- `components/InvoicePreview.tsx` - Template invoice + print PDF

## Format Invoice
Auto-number: `INV/{tahun}/{counter}` (contoh: INV/2025/001)
