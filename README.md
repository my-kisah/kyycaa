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

- Anda bisa mengganti `SQLite` ke `PostgreSQL` atau layanan lain bila diperlukan
- Storage gambar tetap menggunakan `Cloudinary`

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
