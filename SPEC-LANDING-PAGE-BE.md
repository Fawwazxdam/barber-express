# Backend Spec: Landing Page Content Management

## Overview
Admin barbershop perlu bisa mengelola konten landing page (gambar hero, galeri, copywriting) dari dashboard. Backend perlu menambah field baru di tabel `tenants` dan endpoint upload gambar.

---

## 1. Database Migration — Tambah Kolom ke Tabel `tenants`

```sql
ALTER TABLE tenants ADD COLUMN hero_image TEXT;
ALTER TABLE tenants ADD COLUMN hero_title TEXT;
ALTER TABLE tenants ADD COLUMN hero_description TEXT;
ALTER TABLE tenants ADD COLUMN tagline TEXT;
ALTER TABLE tenants ADD COLUMN about_text TEXT;
ALTER TABLE tenants ADD COLUMN gallery_images JSON;  -- array of image URLs
ALTER TABLE tenants ADD COLUMN cta_title TEXT;
ALTER TABLE tenants ADD COLUMN cta_description TEXT;
ALTER TABLE tenants ADD COLUMN cta_button_text TEXT;
```

Semua kolom baru **nullable** — kalau kosong, frontend pakai default value.

---

## 2. Update Tenant Repository

### SELECT Query
Tambahkan semua kolom baru ke SELECT statement:

```sql
SELECT 
  id, name, slug, phone, address, isActive, openTime, closeTime,
  createdAt, updatedAt,
  heroImage, heroTitle, heroDescription, tagline, aboutText,
  galleryImages, ctaTitle, ctaDescription, ctaButtonText
FROM tenants
WHERE ...
```

### Update Query (PATCH)
Pastikan query UPDATE bisa handle field-field baru. Contoh PostgreSQL:

```sql
UPDATE tenants 
SET 
  hero_image = COALESCE($1, hero_image),
  hero_title = COALESCE($2, hero_title),
  hero_description = COALESCE($3, hero_description),
  tagline = COALESCE($4, tagline),
  about_text = COALESCE($5, about_text),
  gallery_images = COALESCE($6, gallery_images),
  cta_title = COALESCE($7, cta_title),
  cta_description = COALESCE($8, cta_description),
  cta_button_text = COALESCE($9, cta_button_text),
  updated_at = NOW()
WHERE id = $10
RETURNING *;
```

> Catatan: Untuk `gallery_images` gunakan `jsonb` type di PostgreSQL atau `JSON` di MySQL.

---

## 3. Update Tenant Service

Pastikan update function menerima dan mem-pass field baru:

```typescript
interface UpdateTenantLandingPageData {
  heroImage?: string | null;
  heroTitle?: string | null;
  heroDescription?: string | null;
  tagline?: string | null;
  aboutText?: string | null;
  galleryImages?: string[] | null;
  ctaTitle?: string | null;
  ctaDescription?: string | null;
  ctaButtonText?: string | null;
}
```

---

## 4. Update Tenant Controller

PATCH `/tenants/:id` harus bisa menerima field baru dari request body. Field-field baru di-merge dengan field existing (name, phone, address, dll).

### Request Body Example (PATCH /tenants/:id)
```json
{
  "name": "Barbershop Updated",
  "heroImage": "/uploads/hero-abc123.jpg",
  "heroTitle": "Gaya Rambut Terbaik.",
  "heroDescription": "Selamat datang di barbershop kami...",
  "tagline": "Potongan Tepat. Gaya Meningkat.",
  "aboutText": "Kami sudah beroperasi sejak 2020...",
  "galleryImages": [
    "/uploads/gallery-1.jpg",
    "/uploads/gallery-2.jpg"
  ],
  "ctaTitle": "Siap Tampil Beda?",
  "ctaDescription": "Jangan biarkan antrian merusak harimu.",
  "ctaButtonText": "Reservasi Sekarang"
}
```

### Response (200)
Harus return **semua field** termasuk yang baru:
```json
{
  "id": "uuid",
  "name": "Barbershop Updated",
  "slug": "barbershop-updated",
  "heroImage": "/uploads/hero-abc123.jpg",
  "heroTitle": "Gaya Rambut Terbaik.",
  "heroDescription": "Selamat datang di barbershop kami...",
  "tagline": "Potongan Tepat. Gaya Meningkat.",
  "aboutText": "Kami sudah beroperasi sejak 2020...",
  "galleryImages": ["/uploads/gallery-1.jpg", "/uploads/gallery-2.jpg"],
  "ctaTitle": "Siap Tampil Beda?",
  "ctaDescription": "Jangan biarkan antrian merusak harimu.",
  "ctaButtonText": "Reservasi Sekarang",
  "phone": "+6281234567890",
  "address": "Jl. Contoh No.1",
  "isActive": true,
  "openTime": "09:00",
  "closeTime": "21:00"
}
```

---

## 5. Upload Endpoint — `POST /media/upload-landing`

Upload gambar untuk landing page (hero dan galeri).

**Headers:**
```
Content-Type: multipart/form-data
Cookie: access_token=<token>
```

**Form Fields:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `image` | File | Ya | File gambar (jpg, png, webp), max 5MB |
| `type` | String | Ya | `"tenant-hero"` atau `"tenant-gallery"` |

**Behavior:**
- Simpan file ke `/uploads/` dengan nama unik (contoh: `tenant-hero-{timestamp}-{uuid}.jpg`)
- Buat record di tabel `media` dengan type = `tenant-hero` atau `tenant-gallery`
- Set `referenceId` ke tenant ID

**Success Response (201):**
```json
{
  "id": "uuid-media",
  "url": "/uploads/tenant-hero-1718888888-abc123.jpg",
  "filename": "tenant-hero-1718888888-abc123.jpg",
  "mimeType": "image/jpeg",
  "size": 102400,
  "type": "tenant-hero"
}
```

Frontend akan pakai field `url` untuk disimpan di tenant data.

**Error Responses:**
- `400` — File tidak ada atau format tidak didukung
- `401` — Unauthenticated
- `403` — Bukan admin

---

## 6. File yang Perlu Diubah

| File | Perubahan |
|------|-----------|
| Database migration | Tambah 9 kolom baru ke `tenants` |
| `src/db/tenants.repository.ts` | Update SELECT + UPDATE query |
| `src/services/tenants.service.ts` | Handle field baru di update |
| `src/controllers/tenants.controller.ts` | Accept field baru di PATCH |
| `src/routes/media.route.ts` | Tambah `POST /media/upload-landing` |
| `src/services/media.service.ts` | Handle upload + create media record |

---

## 7. Flow Lengkap

```
1. Admin buka /dashboard/admin/landing-page
2. Admin upload gambar hero → POST /media/upload-landing → URL gambar didapat
3. Admin isi teks hero, tagline, about, CTA
4. Admin upload gambar galeri (beberapa sekaligus) → POST /media/upload-landing per gambar
5. Admin klik "Simpan" → PATCH /tenants/:id dengan semua data + URL gambar
6. Landing page /{slug} load data tenant → tampilkan gambar dari URL server
```

---

## 8. Catatan Penting

- **Field nullable**: Semua field baru nullable. Frontend handle default value kalau kosong.
- **gallery_images**: Simpan sebagai JSON array of strings.
- **Upload pattern**: Ikuti pattern barber image upload yang sudah ada.
- **Response harus return field baru** agar frontend bisa tampilkan data yang baru disimpan.
