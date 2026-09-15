import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

const root = process.cwd()

const vite = await createServer({
  root,

  server: {
    middlewareMode: true,
  },

  appType: 'custom',
})

const entry = (await vite.ssrLoadModule('/src/entry-server.ts')) as {
  render: (route: string) => Promise<{
    html: string
  }>
}

const templatePath = path.join(root, 'dist', 'index.html')

if (!fs.existsSync(templatePath)) {
  throw new Error('dist/index.html을 찾을 수 없습니다. 먼저 vite build를 실행해야 합니다.')
}

const template = fs.readFileSync(templatePath, 'utf8')

const categories = ['stock', 'tax', 'accounting'] as const

const categoryTitles: Record<(typeof categories)[number], string> = {
  stock: '주식',
  tax: '세금',
  accounting: '재무회계',
}

type PostMeta = {
  slug?: string
  title?: string
  description?: string
  date?: string
  updated?: string
}

function readPosts(category: string): PostMeta[] {
  const directory = path.join(root, 'src', 'data', 'posts', category)

  if (!fs.existsSync(directory)) {
    return []
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const filePath = path.join(directory, file)

      return JSON.parse(fs.readFileSync(filePath, 'utf8')) as PostMeta
    })
}

const posts = categories.flatMap((category) =>
  readPosts(category).map((post) => ({
    ...post,
    category,
  })),
)

const routes = new Set<string>()

routes.add('/')
routes.add('/calculators/loan/')
routes.add('/calculators/savings/')
routes.add('/calculators/salary/')

for (const category of categories) {
  routes.add(`/${category}/`)

  for (const post of posts.filter((item) => item.category === category)) {
    if (post.slug) {
      routes.add(`/${category}/${post.slug}/`)
    }
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function getMeta(route: string) {
  let title = '코지머니 | 금융 정보와 계산기'

  let description =
    '코지머니는 주식, 세금, 재무회계 정보와 금융 계산기를 제공하는 금융 정보 사이트입니다.'

  let ogType = 'website'

  const postMatch = route.match(/^\/(stock|tax|accounting)\/([^/]+)\/$/)

  if (postMatch) {
    const [, category, slug] = postMatch

    const post = posts.find((item) => item.category === category && item.slug === slug)

    if (post) {
      title = `${post.title ?? '게시글'} | CozyMoney`

      description = post.description ?? 'CozyMoney에서 제공하는 금융 정보입니다.'

      ogType = 'article'
    }
  } else {
    const categoryMatch = route.match(/^\/(stock|tax|accounting)\/$/)

    if (categoryMatch) {
      const category = categoryMatch[1] as keyof typeof categoryTitles

      title = `${categoryTitles[category]} | CozyMoney`

      description = `${categoryTitles[category]} 관련 금융 정보를 확인할 수 있습니다.`
    } else if (route === '/calculators/loan/') {
      title = '대출 계산기 | CozyMoney'

      description = '대출 원리금과 상환액을 계산할 수 있습니다.'
    } else if (route === '/calculators/savings/') {
      title = '예금·적금 계산기 | CozyMoney'

      description = '예금과 적금의 예상 이자와 만기 금액을 계산할 수 있습니다.'
    } else if (route === '/calculators/salary/') {
      title = '월급·시급 계산기 | CozyMoney'

      description = '월급과 시급을 기준으로 급여를 계산할 수 있습니다.'
    }
  }

  const canonical = `https://cozymoney.kr${route}`

  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)

  return `
    <title>${safeTitle}</title>
    <meta
      name="description"
      content="${safeDescription}"
    />
    <meta name="robots" content="index,follow" />
    <link
      rel="canonical"
      href="${canonical}"
    />
    <meta
      property="og:title"
      content="${safeTitle}"
    />
    <meta
      property="og:description"
      content="${safeDescription}"
    />
    <meta
      property="og:url"
      content="${canonical}"
    />
    <meta
      property="og:type"
      content="${ogType}"
    />
    <meta
      name="twitter:card"
      content="summary_large_image"
    />
  `
}

function removeExistingSeo(html: string) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>\s*/i, '')
    .replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>\s*/i, '')
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>\s*/i, '')
}

for (const route of routes) {
  const result = await entry.render(route)

  const pageTemplate = removeExistingSeo(template)

  const html = pageTemplate
    .replace('</head>', `${getMeta(route)}</head>`)
    .replace('<div id="app"></div>', `<div id="app">${result.html}</div>`)

  const outputDir = route === '/' ? path.join(root, 'dist') : path.join(root, 'dist', route)

  fs.mkdirSync(outputDir, {
    recursive: true,
  })

  fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8')
}

await vite.close()

console.log(`SSG ${routes.size} pages`)
