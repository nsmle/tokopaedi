# Sistem Rekomendasi Product E-Commerce Menggunakan Content-based Filtering

Dataset: [https://kaggle.com/datasets/nsmlehq/tokopedia-products-2025/](https://www.kaggle.com/datasets/nsmlehq/tokopedia-products-2025/)

Alur penelititan:

```
[Dataset CSV]
     ↓
[Preprocessing Pipeline]
     ↓
[TF-IDF Vectorizer]
     ↓
[Cosine Similarity Matrix]
     ↓
[Recommendation Engine]
     ↓
[Backend Service]
     ↓
[Marketplace UI]
```

## Setup & Installation

> **Note**: [Install bun](https://bun.com/docs/installation).

#### Install Dependencies

```
bun install
```

#### Setup Database

1. Copy `.env.example` ke `.env.local` atau `.env`
2. Set `DATABASE_URL` di `.env.local`atau di`.env` dengan postgress connection url anda. see: [prisma connection url](https://www.prisma.io/docs/orm/overview/databases/postgresql#connection-url)
3. Jalankan `bunx prisma generate` untuk generate prisma client.
4. Jalankan `bunx prisma migrate dev` untuk migrasi database.
5. Jalankan `bunx prisma db seed` untuk seeding data ke database.

#### Setup Images & Thumbnail

Images dan thumbnails products tidak di commit ataupun disertakan dalam repository ini karena sizenya yang terlalu besar, images & thumbnails product terletak pada path `public/images` dan `public/thumbnails`.
Sebagai solusi lain, download image dan thumbnail ini secara terpisah menggunakan perintah berikut:

- Download thumbnails:

```bash
curl -L "https://drive.usercontent.google.com/download?export=download&id=1onrH9RkHe8X36a030snolMNJMvJuI9Ws&confirm=t" | tar -xzf - -C public/
```

- Download images:

```bash
curl -L "https://drive.usercontent.google.com/download?export=download&id=1mo-ImnfJY0VepOp5IjA9M7qEvtEcS7G-&confirm=t" | tar -xzf - -C public/
```

Note: masuk ke working directory root project ini terlebih dahulu sebelum menjalankan perintah diatas.

#### Run Development Server

Jalankan

```
bun run dev
```

dan buka [http://localhost:3000](http://localhost:3000) di browser.
