import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import fs from 'node:fs'
import path from 'node:path'
import App from './App.vue'

export function routes() {
  const root=process.cwd()
  const out=['/','/stock/','/tax/','/accounting/','/calculators/loan','/calculators/savings','/calculators/installment-savings','/calculators/salary','/calculators/hourly-wage','/privacy']
  for (const category of ['stock','tax','accounting']) {
    const dir=path.join(root,'src','data','posts',category)
    if(fs.existsSync(dir)) for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))) out.push(`/${category}/${file.replace(/\.json$/,'')}/`)
  }
  return out
}
export async function render(route:string) {
  const app=createSSRApp(App)
  return await renderToString(app,{})
}
