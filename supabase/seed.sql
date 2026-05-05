-- ============================================================
-- GameShelf Dummy Data
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Step 1: Bersihkan data lama (jika ada)
DELETE FROM order_items WHERE product_id IN (
  SELECT id FROM products WHERE slug IN (
    'the-last-of-us-part-i','god-of-war-ragnarok','marvels-spider-man-2',
    'horizon-forbidden-west','final-fantasy-xvi','zelda-tears-of-the-kingdom',
    'mario-kart-8-deluxe','super-mario-bros-wonder','halo-infinite',
    'forza-horizon-5','elden-ring','cyberpunk-2077-ultimate-edition','baldurs-gate-3'
  )
);
DELETE FROM products WHERE slug IN (
  'the-last-of-us-part-i','god-of-war-ragnarok','marvels-spider-man-2',
  'horizon-forbidden-west','final-fantasy-xvi','zelda-tears-of-the-kingdom',
  'mario-kart-8-deluxe','super-mario-bros-wonder','halo-infinite',
  'forza-horizon-5','elden-ring','cyberpunk-2077-ultimate-edition','baldurs-gate-3'
);
DELETE FROM categories WHERE slug IN ('playstation','nintendo','xbox','pc');

-- Step 2: Insert categories dengan UUID tetap
INSERT INTO categories (id, name, slug, description) VALUES
  ('11111111-0000-0000-0000-000000000001', 'PlayStation', 'playstation', 'Game untuk PlayStation 4 dan 5'),
  ('11111111-0000-0000-0000-000000000002', 'Nintendo',    'nintendo',    'Game untuk Nintendo Switch'),
  ('11111111-0000-0000-0000-000000000003', 'Xbox',        'xbox',        'Game untuk Xbox Series X/S'),
  ('11111111-0000-0000-0000-000000000004', 'PC',          'pc',          'Game untuk PC / Windows');

-- Step 3: Insert products
INSERT INTO products (name, slug, description, price, stock, category_id, images, is_active) VALUES

  -- PlayStation
  (
    'The Last of Us Part I',
    'the-last-of-us-part-i',
    'Remake sinematik dari game legendaris Naughty Dog. Ikuti perjalanan Joel dan Ellie melewati Amerika Serikat yang hancur akibat wabah mematikan. Grafis next-gen untuk PS5.',
    799000, 12,
    '11111111-0000-0000-0000-000000000001',
    ARRAY['https://picsum.photos/seed/tlou1/400/400'],
    true
  ),
  (
    'God of War Ragnarök',
    'god-of-war-ragnarok',
    'Kratos dan Atreus harus menghadapi takdir mereka saat Ragnarök mendekat. Petualangan epik melewati Sembilan Alam Norse dengan gameplay action brutal.',
    849000, 8,
    '11111111-0000-0000-0000-000000000001',
    ARRAY['https://picsum.photos/seed/gowr/400/400'],
    true
  ),
  (
    'Marvel''s Spider-Man 2',
    'marvels-spider-man-2',
    'Peter Parker dan Miles Morales kembali menghadapi ancaman terbesar Manhattan. Mainkan keduanya secara bergantian dalam aksi superhero terspektakuler di PS5.',
    899000, 5,
    '11111111-0000-0000-0000-000000000001',
    ARRAY['https://picsum.photos/seed/spiderman2/400/400'],
    true
  ),
  (
    'Horizon Forbidden West',
    'horizon-forbidden-west',
    'Aloy menjelajahi dunia Barat yang berbahaya penuh mesin raksasa. Open-world action-RPG dengan visual memukau dan cerita mendebarkan.',
    599000, 20,
    '11111111-0000-0000-0000-000000000001',
    ARRAY['https://picsum.photos/seed/horizon/400/400'],
    true
  ),
  (
    'Final Fantasy XVI',
    'final-fantasy-xvi',
    'Kisah epik Clive Rosfield dalam dunia Valisthea yang dilanda perang. Action RPG dengan sistem pertarungan dinamis dan narasi dewasa dari Square Enix.',
    749000, 15,
    '11111111-0000-0000-0000-000000000001',
    ARRAY['https://picsum.photos/seed/ff16/400/400'],
    true
  ),

  -- Nintendo
  (
    'The Legend of Zelda: Tears of the Kingdom',
    'zelda-tears-of-the-kingdom',
    'Link menjelajahi Hyrule yang kini memiliki pulau-pulau terbang di langit. Gunakan kemampuan Ultrahand, Fuse, dan Recall untuk memecahkan puzzle dan mengalahkan musuh.',
    799000, 18,
    '11111111-0000-0000-0000-000000000002',
    ARRAY['https://picsum.photos/seed/zelda-totk/400/400'],
    true
  ),
  (
    'Mario Kart 8 Deluxe',
    'mario-kart-8-deluxe',
    'Balapan seru bersama karakter Nintendo favorit di 96 lintasan. Mendukung hingga 4 pemain lokal dan 12 pemain online. Game wajib untuk Nintendo Switch.',
    649000, 25,
    '11111111-0000-0000-0000-000000000002',
    ARRAY['https://picsum.photos/seed/mariokart/400/400'],
    true
  ),
  (
    'Super Mario Bros. Wonder',
    'super-mario-bros-wonder',
    'Petualangan Mario terbaru yang penuh kejutan dengan mechanic Wonder Flower. Tampilan 2D yang segar dengan kreativitas level yang luar biasa dari Nintendo.',
    699000, 10,
    '11111111-0000-0000-0000-000000000002',
    ARRAY['https://picsum.photos/seed/smbrwonder/400/400'],
    true
  ),

  -- Xbox
  (
    'Halo Infinite',
    'halo-infinite',
    'Master Chief kembali dalam petualangan open-world pertama franchise Halo. Kampanye sinematik, multiplayer kompetitif, dan mode co-op yang adiktif.',
    549000, 14,
    '11111111-0000-0000-0000-000000000003',
    ARRAY['https://picsum.photos/seed/haloinfinite/400/400'],
    true
  ),
  (
    'Forza Horizon 5',
    'forza-horizon-5',
    'Racing game open-world terbaik dengan setting Meksiko yang memukau. Ratusan mobil, cuaca dinamis, dan event yang terus diperbarui.',
    649000, 9,
    '11111111-0000-0000-0000-000000000003',
    ARRAY['https://picsum.photos/seed/forzah5/400/400'],
    true
  ),

  -- PC
  (
    'Elden Ring',
    'elden-ring',
    'Mahakarya FromSoftware x George R.R. Martin. Open-world soulslike dengan dungeon misterius, bos menantang, dan lore yang dalam. GOTY 2022.',
    599000, 22,
    '11111111-0000-0000-0000-000000000004',
    ARRAY['https://picsum.photos/seed/eldenring/400/400'],
    true
  ),
  (
    'Cyberpunk 2077: Ultimate Edition',
    'cyberpunk-2077-ultimate-edition',
    'RPG open-world futuristik di Night City. Termasuk ekspansi Phantom Liberty. Kini sudah dioptimalkan penuh dan jadi salah satu game PC terbaik.',
    649000, 16,
    '11111111-0000-0000-0000-000000000004',
    ARRAY['https://picsum.photos/seed/cyberpunk/400/400'],
    true
  ),
  (
    'Baldur''s Gate 3',
    'baldurs-gate-3',
    'RPG turn-based terbaik dekade ini dari Larian Studios. Kebebasan pilihan yang luar biasa, dunia yang kaya cerita, dan co-op hingga 4 pemain.',
    699000, 0,
    '11111111-0000-0000-0000-000000000004',
    ARRAY['https://picsum.photos/seed/bg3/400/400'],
    true
  );