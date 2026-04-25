# Cerita Kita

Website fullstack romantis modern untuk menyimpan, menampilkan, dan mengelola kenangan spesial dengan dua role utama: `user` dan `admin`.

## Stack

- `Next.js 15` + `React 19` + `TypeScript`
- `Prisma ORM`
- `SQLite` untuk development lokal cepat
- `Auth.js / NextAuth`
- `Cloudinary` untuk storage gambar
- `Tailwind CSS v4`
- `Recharts` untuk analytics
- `Sonner` untuk toast notification

## Fitur utama

- Landing page romantis premium, responsif, dan profesional
- Register user via `nama + username + email + password`
- Login user via `email/username + password`
- Login admin terpisah dan hanya untuk akun admin yang ditentukan pemilik
- Dashboard user dengan pencarian dan filter
- Detail konten dengan komentar, penghapusan komentar sendiri, dan tracking view anti-spam per 12 jam
- Dashboard admin lengkap:
  - overview statistik
  - kelola konten
  - tambah/edit/hapus konten
  - hide/show konten
  - moderasi komentar
  - analytics populer berdasarkan views, komentar, dan engagement

## Struktur folder

```text
prisma/
  schema.prisma
  seed.ts
src/
  actions/
  app/
    admin/
    api/
    dashboard/
    login/
    memories/
    register/
  components/
    admin/
    auth/
    comments/
    layout/
    marketing/
    memories/
    providers/
    ui/
  lib/
  types/
```

## Environment variable

Salin `.env.example` menjadi `.env` lalu isi nilainya.

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="ganti-dengan-secret-panjang-dan-aman"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

ADMIN_EMAILS="admin@email.com,owner@email.com"
SEED_ADMIN_PASSWORD="Admin12345!"

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

## Environment variable production di Vercel

Isi variable ini di menu `Project Settings > Environment Variables` pada Vercel, lalu redeploy.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
AUTH_SECRET="secret-panjang-random-untuk-production"
NEXT_PUBLIC_APP_URL="https://domain-anda.vercel.app"

ADMIN_EMAILS="admin@email.com,owner@email.com"
SEED_ADMIN_PASSWORD="PasswordAwalAdmin123!"

CLOUDINARY_CLOUD_NAME="cloud-name-anda"
CLOUDINARY_API_KEY="api-key-cloudinary"
CLOUDINARY_API_SECRET="api-secret-cloudinary"
```

## Setup lokal

1. Install dependency

```bash
npm install
```

2. Isi `.env`

3. Generate Prisma client

```bash
npm run prisma:generate
```

4. Seed data awal

```bash
npm run prisma:seed
```

5. Jalankan development server

```bash
npm run dev
```

## Cara login

### User

- Register dengan `nama`, `username`, `email`, dan `password`
- Login bisa memakai `email` atau `username`

### Admin

- Login melalui halaman `/admin/login`
- Akun admin ditentukan dari `ADMIN_EMAILS`
- Tidak ada register admin publik

## Cara menentukan akun admin

1. Isi `ADMIN_EMAILS` dengan daftar email admin, dipisahkan koma.
2. Jalankan `npm run prisma:seed` untuk membuat akun admin awal berbasis email tersebut.
3. Password awal admin diambil dari `SEED_ADMIN_PASSWORD`.

Catatan:
- Email admin yang ada di `ADMIN_EMAILS` tidak bisa didaftarkan dari halaman register publik.
- Admin dan user sama-sama menggunakan login email/username + password, tetapi route admin tetap diproteksi oleh role.

## Database dan storage

### Development

- Database lokal: `SQLite`
- File database: `dev.db`

### Production

- `SQLite` hanya aman untuk development lokal
- Untuk Vercel, gunakan `PostgreSQL` online seperti `Supabase` atau `Neon`
- Storage gambar production wajib menggunakan `Cloudinary`
- Upload file lokal hanya untuk development dan otomatis ditolak di production

## Checklist go-live Vercel

1. Pastikan source terbaru sudah ter-push ke GitHub.
2. Di Vercel, isi semua `Environment Variables`.
3. Gunakan `DATABASE_URL` PostgreSQL online.
4. Aktifkan kredensial `Cloudinary` agar upload foto profil dan gambar konten tidak gagal.
5. Redeploy project setelah env diubah. Vercel menerapkan env baru hanya untuk deployment berikutnya, bukan deployment lama. Sumber: [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
6. Uji:
   - login user
   - login admin
   - upload foto profil
   - tambah konten bergambar
   - komentar
   - ban/hapus user

## Cara menyiapkan PostgreSQL online

### Opsi 1: Supabase

- Buat project database baru di Supabase.
- Ambil connection string Postgres dari dashboard database. Supabase menyediakan beberapa jenis connection string dan untuk aplikasi serverless gunakan string yang sesuai dengan kebutuhan koneksi Anda. Sumber: [Supabase connection strings](https://supabase.com/docs/reference/postgres/connection-strings)
- Tempel nilainya ke `DATABASE_URL` di Vercel.

### Opsi 2: Neon

- Buat project database baru di Neon.
- Salin connection string PostgreSQL dari dashboard Neon. Sumber: [Neon connection guide](https://neon.com/docs/get-started-with-neon/connect-neon)
- Tempel ke `DATABASE_URL` di Vercel.

Setelah database online siap:

1. Ubah `DATABASE_URL` di Vercel ke connection string PostgreSQL.
2. Jalankan sinkronisasi schema dari lokal:

```bash
npx prisma db push
```

3. Jika ingin data awal production, set env production yang benar lalu jalankan:

```bash
npm run prisma:seed
```

Catatan:
- Schema Prisma saat ini masih memakai provider `sqlite`, jadi sebelum production database benar-benar dipakai, datasource perlu diubah ke `postgresql`.
- Lakukan perubahan provider itu tepat saat Anda sudah memegang connection string PostgreSQL production, agar local dev dan production tidak saling bentrok.

## Cara menyiapkan Cloudinary

1. Buat akun Cloudinary.
2. Ambil `cloud name`, `API key`, dan `API secret` dari dashboard / halaman API Keys Cloudinary. Sumber: [Cloudinary credentials](https://cloudinary.com/documentation/developer_onboarding_faq_find_credentials)
3. Isi ketiga nilai itu di Vercel.
4. Redeploy project.

## Data awal dari seed

Seed akan membuat:

- akun admin dari `ADMIN_EMAILS`
- satu akun user demo:
  - email: `user@ceritakita.id`
  - username: `alya`
  - password: `User12345!`
- tiga konten demo
- beberapa komentar demo

## Catatan keamanan

- Password disimpan dalam bentuk hash `bcrypt`
- Role admin dijaga dari UI, middleware, dan server action
- Register admin publik tidak tersedia
- Komentar disanitasi untuk mencegah XSS
- Upload gambar dibatasi format dan ukuran
- View memakai bucket 12 jam agar tidak mudah spam berlebihan
