import type { Post } from '../types/content'

type PostModule = () => Promise<string>

const postModules = import.meta.glob('./posts/*/*.json', {
  query: '?raw',
  import: 'default',
}) as Record<string, PostModule>

const cache = new Map<string, Post>()

function getPostKey(category: string, slug: string) {
  return `./posts/${category}/${slug}.json`
}

async function loadPostByKey(key: string): Promise<Post | null> {
  const cached = cache.get(key)

  if (cached) {
    return cached
  }

  const loader = postModules[key]

  if (!loader) {
    return null
  }

  try {
    const raw = await loader()
    const post = JSON.parse(raw) as Post

    cache.set(key, post)

    return post
  } catch {
    return null
  }
}

export async function loadPosts(): Promise<Post[]> {
  const entries = await Promise.all(
    Object.entries(postModules).map(async ([key, loader]) => {
      const cached = cache.get(key)

      if (cached) {
        return cached
      }

      try {
        const raw = await loader()
        const post = JSON.parse(raw) as Post

        cache.set(key, post)

        return post
      } catch {
        return null
      }
    }),
  )

  return entries
    .filter((post): post is Post => post !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function loadPostsByCategory(category: string): Promise<Post[]> {
  const prefix = `./posts/${category}/`

  const keys = Object.keys(postModules).filter((key) => key.startsWith(prefix))

  const entries = await Promise.all(keys.map((key) => loadPostByKey(key)))

  return entries
    .filter((post): post is Post => post !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function findPost(category: string, slug: string): Promise<Post | null> {
  const key = getPostKey(category, slug)

  return loadPostByKey(key)
}
