/**
 * Script: fetch-game-images.mjs
 * Update cover art produk langsung dari Steam CDN + Nintendo eShop CDN
 * Tidak perlu API key apapun.
 *
 * Cara pakai:
 *   node --env-file=.env.local scripts/fetch-game-images.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) { console.error('❌ NEXT_PUBLIC_SUPABASE_URL kosong'); process.exit(1) }
if (!SUPABASE_KEY) { console.error('❌ SUPABASE_SERVICE_ROLE_KEY kosong'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Steam CDN portrait format: /steam/apps/{APP_ID}/library_600x900.jpg
const STEAM = (appId) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`

// Nintendo eShop CDN
const NINTENDO = (gameId) =>
  `https://assets.nintendo.com/image/upload/c_fill,w_600/q_auto:best/f_auto/ncom/software/switch/${gameId}/boxart`

const GAME_IMAGES = {
  // ── PlayStation (Steam) ──────────────────────────────────────
  'the-last-of-us-part-i':          STEAM('1888930'),
  'god-of-war-ragnarok':             STEAM('2322010'),
  'marvels-spider-man-2':            STEAM('2195910'),   // PC App ID (bukan 2000950)
  'horizon-forbidden-west':          STEAM('1454950'),
  'final-fantasy-xvi':               STEAM('2515020'),

  // ── Nintendo (URL langsung dari Nintendo.com) ─────────────────
  'zelda-tears-of-the-kingdom':
    'https://assets.nintendo.com/image/upload/f_auto/q_auto/ncom/software/switch/70010000063714/boxart',
  'mario-kart-8-deluxe':
    'https://assets.nintendo.com/image/upload/f_auto/q_auto/ncom/software/switch/70010000000153/boxart',
  'super-mario-bros-wonder':
    'https://assets.nintendo.com/image/upload/f_auto/q_auto/ncom/software/switch/70010000059547/boxart',

  // ── Xbox (Steam) ─────────────────────────────────────────────
  'halo-infinite':                   STEAM('1240440'),
  'forza-horizon-5':                 STEAM('1551360'),

  // ── PC (Steam) ───────────────────────────────────────────────
  'elden-ring':                      STEAM('1245620'),
  'cyberpunk-2077-ultimate-edition': STEAM('1091500'),
  'baldurs-gate-3':                  STEAM('1086940'),
}

async function main() {
  console.log('🎮 Update cover art produk...\n')

  let success = 0
  let failed  = 0

  for (const [slug, imageUrl] of Object.entries(GAME_IMAGES)) {
    const { error } = await supabase
      .from('products')
      .update({ images: [imageUrl] })
      .eq('slug', slug)

    if (error) {
      console.error(`❌ ${slug}: ${error.message}`)
      failed++
    } else {
      console.log(`✅ ${slug}`)
      success++
    }
  }

  console.log(`\n📊 Selesai: ${success} berhasil, ${failed} gagal`)
  console.log('🔄 Refresh halaman untuk melihat hasilnya.')
}

main()
