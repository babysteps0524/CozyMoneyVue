import fs from 'node:fs'
import path from 'node:path'

const base = 'https://cozymoney.kr'

const urls = [
  '/',
  '/stock/',
  '/tax/',
  '/accounting/',
  '/calculators/loan/',
  '/calculators/savings/',
  '/calculators/salary/',
]

for (const category of ['stock', 'tax', 'accounting']) {
  const directory = path.join('src', 'data', 'posts', category)

  if (!fs.existsSync(directory)) {
    continue
  }

  const files = fs.readdirSync(directory).filter((file) => file.endsWith('.json'))

  for (const file of files) {
    const slug = file.slice(0, -5)

    urls.push(`/${category}/${slug}/`)
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${base}${url}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>
`

fs.writeFileSync(path.join('dist', 'sitemap.xml'), sitemap, 'utf8')

const robots = `User-agent: *
Allow: /
Sitemap: ${base}/sitemap.xml
`

fs.writeFileSync(path.join('dist', 'robots.txt'), robots, 'utf8')
