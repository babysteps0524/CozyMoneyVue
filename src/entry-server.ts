import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

import App from './App.vue'
import router from './router'

export async function render(url: string) {
  const app = createSSRApp(App)

  app.use(router)

  await router.push(url)
  await router.isReady()

  const html = await renderToString(app)

  return {
    html,
  }
}
