import { getUsedImageUrls } from './imageHistory'

const bad =
  /\b(person|people|man|woman|child|portrait|face|selfie|celebrity|politician|casino|weapon|alcohol|smoking)\b/i

type ImageResult = {
  src: string
  alt: string
  provider: 'pexels' | 'unsplash'
  credit: string
}

async function get(url: string, headers: Record<string, string>) {
  const response = await fetch(url, {
    headers,
  })

  if (!response.ok) {
    throw new Error(String(response.status))
  }

  return response.json()
}

/* ============================================================
 * 이미지 후보 검증
 * ============================================================ */

function isValidImage(image: ImageResult | undefined): image is ImageResult {
  if (!image) {
    return false
  }

  if (!image.src) {
    return false
  }

  if (bad.test(JSON.stringify(image))) {
    return false
  }

  return true
}

/* ============================================================
 * URL 기준 provider / credit 정규화
 * ============================================================ */

function normalizeImage(image: ImageResult): ImageResult | null {
  if (!isValidImage(image)) {
    return null
  }

  if (image.src.includes('images.unsplash.com')) {
    return {
      ...image,
      provider: 'unsplash',
      credit: image.credit.includes('Unsplash') ? image.credit : '이미지 출처: Unsplash',
    }
  }

  if (image.src.includes('images.pexels.com')) {
    return {
      ...image,
      provider: 'pexels',
      credit: image.credit.includes('Pexels') ? image.credit : '이미지 출처: Pexels',
    }
  }

  return image
}

/* ============================================================
 * URL 중복 제거
 * ============================================================ */

function uniqueImages(images: ImageResult[]): ImageResult[] {
  const seen = new Set<string>()
  const result: ImageResult[] = []

  for (const image of images) {
    const normalized = normalizeImage(image)

    if (!normalized) {
      continue
    }

    if (seen.has(normalized.src)) {
      continue
    }

    seen.add(normalized.src)
    result.push(normalized)
  }

  return result
}

/* ============================================================
 * 최근 5일 사용 이미지 제거
 * ============================================================ */

function removeRecentlyUsedImages(images: ImageResult[], usedUrls: Set<string>): ImageResult[] {
  return images.filter((image) => !usedUrls.has(image.src))
}

/* ============================================================
 * Pexels
 * ============================================================ */

async function searchPexels(query: string): Promise<ImageResult[]> {
  const key = process.env.PEXELS_API_KEY?.trim()

  if (!key) {
    console.warn('[IMAGE] Pexels API 키 없음')
    return []
  }

  try {
    const data = await get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        `${query} finance no people`,
      )}&orientation=landscape&per_page=20`,
      {
        Authorization: key,
      },
    )

    const photos = Array.isArray(data?.photos) ? data.photos : []

    const results = photos
      .map((photo: any): ImageResult | null => {
        const src = photo?.src?.landscape

        if (!src) {
          return null
        }

        return {
          src,
          alt: typeof photo?.alt === 'string' && photo.alt.trim() ? photo.alt.trim() : query,
          provider: 'pexels',
          credit: `Photo by ${photo?.photographer || 'Pexels'} on Pexels`,
        }
      })
      .filter((image: ImageResult | null): image is ImageResult => image !== null)

    return uniqueImages(results)
  } catch (error) {
    console.warn(
      '[IMAGE] Pexels 검색 실패:',
      error instanceof Error ? error.message : String(error),
    )

    return []
  }
}

/* ============================================================
 * Unsplash
 * ============================================================ */

async function searchUnsplash(query: string): Promise<ImageResult[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim()

  if (!key) {
    console.warn('[IMAGE] Unsplash API 키 없음')
    return []
  }

  try {
    const data = await get(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        `${query} finance no people`,
      )}&orientation=landscape&per_page=20`,
      {
        Authorization: `Client-ID ${key}`,
      },
    )

    const resultsData = Array.isArray(data?.results) ? data.results : []

    const results = resultsData
      .map((photo: any): ImageResult | null => {
        const src = photo?.urls?.regular

        if (!src) {
          return null
        }

        return {
          src,
          alt:
            typeof photo?.alt_description === 'string' && photo.alt_description.trim()
              ? photo.alt_description.trim()
              : query,
          provider: 'unsplash',
          credit: `Photo by ${photo?.user?.name || 'Unsplash'} on Unsplash`,
        }
      })
      .filter((image: ImageResult | null): image is ImageResult => image !== null)

    return uniqueImages(results)
  } catch (error) {
    console.warn(
      '[IMAGE] Unsplash 검색 실패:',
      error instanceof Error ? error.message : String(error),
    )

    return []
  }
}

/* ============================================================
 * 이미지 2개 확보
 *
 * 우선순위:
 *
 * 1. Pexels 1개 + Unsplash 1개
 * 2. Pexels 2개
 * 3. Unsplash 2개
 *
 * 최근 5일 사용 이미지는 제외한다.
 *
 * image-history는 여기서 변경하지 않는다.
 * ============================================================ */

export async function images(query: string): Promise<ImageResult[]> {
  const cleanQuery = query.trim()

  if (!cleanQuery) {
    throw new Error('이미지 검색어가 없습니다.')
  }

  const usedUrls = getUsedImageUrls()

  const [pexelsRaw, unsplashRaw] = await Promise.all([
    searchPexels(cleanQuery),
    searchUnsplash(cleanQuery),
  ])

  const pexels = removeRecentlyUsedImages(pexelsRaw, usedUrls)

  const unsplash = removeRecentlyUsedImages(unsplashRaw, usedUrls)

  console.log(`[IMAGE] 후보: Pexels ${pexelsRaw.length}개 → ${pexels.length}개`)

  console.log(`[IMAGE] 후보: Unsplash ${unsplashRaw.length}개 → ${unsplash.length}개`)

  /* ==========================================================
   * 1순위: Pexels 1개 + Unsplash 1개
   * ========================================================== */

  if (pexels.length >= 1 && unsplash.length >= 1) {
    const selected = [pexels[0], unsplash[0]]

    console.log(`[IMAGE] Pexels 1개 + Unsplash 1개 사용: ${cleanQuery}`)

    return uniqueImages(selected).slice(0, 2)
  }

  /* ==========================================================
   * 2순위: Pexels 2개
   * ========================================================== */

  if (pexels.length >= 2) {
    console.log(`[IMAGE] Pexels 2개 사용: ${cleanQuery}`)

    return pexels.slice(0, 2)
  }

  /* ==========================================================
   * 3순위: Unsplash 2개
   * ========================================================== */

  if (unsplash.length >= 2) {
    console.log(`[IMAGE] Unsplash 2개 사용: ${cleanQuery}`)

    return unsplash.slice(0, 2)
  }

  throw new Error(`최근 5일 중복을 제외하고 이미지 2개를 확보하지 못했습니다: ${cleanQuery}`)
}
