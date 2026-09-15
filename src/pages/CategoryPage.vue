<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { loadPostsByCategory } from '../data/posts'

const props = defineProps<{
  category: 'stock' | 'tax' | 'accounting'
}>()

const categoryTitle = computed(() => {
  const titles = {
    stock: '주식',
    tax: '세금',
    accounting: '재무회계',
  }

  return titles[props.category]
})

const categoryPosts = await loadPostsByCategory(props.category)
</script>

<template>
  <div min-h-screen bg-cm-bg text-cm-text dark:bg-cm-dark-bg dark:text-cm-dark-text>
    <header border-b border-cm-line bg-cm-surface dark:border-cm-dark-line dark:bg-cm-dark-surface>
      <div page flex flex-wrap items-center justify-between gap-4 py-4>
        <RouterLink
          to="/"
          text-xl
          font-900
          text-cm-primary
          active-scale-0.95
          dark:text-cm-dark-primary
        >
          CozyMoney
        </RouterLink>

        <nav flex flex-wrap justify-end gap-1 text-sm font-700>
          <a href="/stock/" p-2 active-scale-0.95> 주식 </a>

          <a href="/tax/" p-2 active-scale-0.95> 세금 </a>

          <a href="/accounting/" p-2 active-scale-0.95> 재무회계 </a>

          <RouterLink to="/calculators/loan/" p-2 active-scale-0.95> 대출 </RouterLink>

          <RouterLink to="/calculators/savings/" p-2 active-scale-0.95> 예금·적금 </RouterLink>

          <RouterLink to="/calculators/salary/" p-2 active-scale-0.95> 월급·시급 </RouterLink>
        </nav>
      </div>
    </header>

    <main page py-8>
      <header mb-8>
        <h1 text-3xl font-900>
          {{ categoryTitle }}
        </h1>

        <p mt-3 text-cm-muted dark:text-cm-dark-muted>
          {{ categoryTitle }} 관련 금융 정보를 확인할 수 있습니다.
        </p>
      </header>

      <section v-if="categoryPosts.length" grid gap-4>
        <article
          v-for="post in categoryPosts"
          :key="post.id ?? post.slug"
          surface
          p-6
          transition
          active-scale-0.95
        >
          <RouterLink :to="`/${post.category}/${post.slug}/`" block>
            <time text-sm text-cm-muted dark:text-cm-dark-muted>
              {{ post.date }}
            </time>

            <h2 mt-2 text-xl font-800>
              {{ post.title }}
            </h2>

            <p v-if="post.description" mt-3 text-cm-muted dark:text-cm-dark-muted>
              {{ post.description }}
            </p>
          </RouterLink>
        </article>
      </section>

      <section v-else surface p-8 text-center>
        <p text-cm-muted dark:text-cm-dark-muted>아직 등록된 게시글이 없습니다.</p>
      </section>
    </main>
  </div>
</template>
