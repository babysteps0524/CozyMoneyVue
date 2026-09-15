<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { findPost } from '../data/posts'

const props = defineProps<{
  category: 'stock' | 'tax' | 'accounting'
  slug: string
}>()

const post = await findPost(props.category, props.slug)

const categoryTitle = computed(() => {
  const titles = {
    stock: '주식',
    tax: '세금',
    accounting: '재무회계',
  }

  return titles[props.category]
})
</script>

<template>
  <div v-if="post" min-h-screen bg-cm-bg text-cm-text dark:bg-cm-dark-bg dark:text-cm-dark-text>
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
      <article max-w-900px mx-auto>
        <div mb-6>
          <RouterLink
            :to="`/${category}/`"
            text-sm
            font-700
            text-cm-primary
            active-scale-0.95
            dark:text-cm-dark-primary
          >
            ← {{ categoryTitle }}
          </RouterLink>
        </div>

        <header mb-8>
          <h1 text-3xl font-900 leading-tight>
            {{ post.title }}
          </h1>

          <p
            v-if="post.description"
            mt-4
            text-lg
            leading-relaxed
            text-cm-muted
            dark:text-cm-dark-muted
          >
            {{ post.description }}
          </p>

          <div mt-4 flex flex-wrap gap-3 text-sm text-cm-muted dark:text-cm-dark-muted>
            <time>{{ post.date }}</time>

            <span v-if="post.updated"> 수정 {{ post.updated }} </span>
          </div>
        </header>

        <div v-for="(section, index) in post.sections ?? []" :key="index" mb-8>
          <!-- 제목 -->
          <h2 v-if="section.type === 'heading' && section.level === 2" text-2xl font-900>
            {{ section.content }}
          </h2>

          <h3 v-else-if="section.type === 'heading' && section.level === 3" text-xl font-800>
            {{ section.content }}
          </h3>

          <h4 v-else-if="section.type === 'heading' && section.level === 4" text-lg font-800>
            {{ section.content }}
          </h4>

          <!-- 일반 문단 -->
          <p v-else-if="section.type === 'paragraph'" text-base leading-8>
            {{ section.content }}
          </p>

          <!-- 순서 없는 목록 -->
          <ul v-else-if="section.type === 'list'" list-disc pl-6 space-y-2>
            <li v-for="(item, itemIndex) in section.items ?? []" :key="itemIndex">
              {{ item }}
            </li>
          </ul>

          <!-- 순서 있는 목록 -->
          <ol v-else-if="section.type === 'orderedList'" list-decimal pl-6 space-y-2>
            <li v-for="(item, itemIndex) in section.items ?? []" :key="itemIndex">
              {{ item }}
            </li>
          </ol>

          <!-- 인용문 -->
          <blockquote
            v-else-if="section.type === 'blockquote'"
            border-l-4
            border-cm-primary
            pl-4
            italic
            text-cm-muted
            dark:text-cm-dark-muted
          >
            {{ section.content }}
          </blockquote>

          <!-- 정보 박스 -->
          <section
            v-else-if="section.type === 'infoBox'"
            rounded-lg
            border
            border-cm-line
            bg-cm-surface
            p-5
            dark:border-cm-dark-line
            dark:bg-cm-dark-surface
          >
            {{ section.content }}
          </section>

          <!-- 주의 박스 -->
          <section
            v-else-if="section.type === 'warningBox'"
            rounded-lg
            border
            border-cm-line
            bg-cm-surface
            p-5
            dark:border-cm-dark-line
            dark:bg-cm-dark-surface
          >
            {{ section.content }}
          </section>

          <!-- 이미지 -->
          <figure v-else-if="section.type === 'image'" m-0>
            <img
              :src="section.src"
              :alt="section.alt ?? post.title ?? 'CozyMoney 이미지'"
              w-full
              rounded-lg
              loading="lazy"
              decoding="async"
            />

            <figcaption v-if="section.credit" mt-2 text-sm text-cm-muted dark:text-cm-dark-muted>
              {{ section.credit }}
            </figcaption>
          </figure>

          <!-- 표 -->
          <div v-else-if="section.type === 'table'" overflow-x-auto>
            <table w-full border-collapse text-left>
              <thead>
                <tr>
                  <th
                    v-for="(header, headerIndex) in section.headers ?? []"
                    :key="headerIndex"
                    border
                    border-cm-line
                    p-3
                    dark:border-cm-dark-line
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(row, rowIndex) in section.rows ?? []" :key="rowIndex">
                  <td
                    v-for="(cell, cellIndex) in row"
                    :key="cellIndex"
                    border
                    border-cm-line
                    p-3
                    dark:border-cm-dark-line
                  >
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- FAQ -->
        <section v-if="post.faq?.length" mt-12>
          <h2 text-2xl font-900>자주 묻는 질문</h2>

          <div mt-6 space-y-6>
            <div v-for="(item, index) in post.faq" :key="index">
              <h3 text-lg font-800>
                {{ item.question }}
              </h3>

              <p mt-2 leading-8 text-cm-muted dark:text-cm-dark-muted>
                {{ item.answer }}
              </p>
            </div>
          </div>
        </section>

        <!-- 출처 -->
        <footer
          v-if="post.sources?.length"
          mt-12
          border-t
          border-cm-line
          pt-6
          dark:border-cm-dark-line
        >
          <h2 text-xl font-800>출처</h2>

          <ul mt-4 list-disc pl-6 space-y-2>
            <li v-for="(source, index) in post.sources" :key="index">
              <a
                :href="source.url"
                target="_blank"
                rel="noopener noreferrer"
                underline
                active-scale-0.95
              >
                {{ source.title }}
              </a>
            </li>
          </ul>
        </footer>
      </article>
    </main>
  </div>

  <main v-else page min-h-screen py-16>
    <section surface mx-auto max-w-800px p-8 text-center>
      <h1 text-3xl font-900>게시글을 찾을 수 없습니다.</h1>

      <RouterLink
        :to="`/${category}/`"
        mt-6
        inline-flex
        rounded-lg
        bg-cm-primary
        px-5
        py-3
        font-700
        text-white
        active-scale-0.95
      >
        {{ categoryTitle }} 목록으로
      </RouterLink>
    </section>
  </main>
</template>
