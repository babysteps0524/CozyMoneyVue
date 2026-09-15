<script setup lang="ts">
import { RouterLink } from 'vue-router'
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

          <RouterLink to="/calculators/loan" p-2 active-scale-0.95> 대출 </RouterLink>

          <RouterLink to="/calculators/savings" p-2 active-scale-0.95> 예금·적금 </RouterLink>

          <RouterLink to="/calculators/salary" p-2 active-scale-0.95> 월급·시급 </RouterLink>
        </nav>
      </div>
    </header>

    <main page py-8>
      <section surface p-8 text-center>
        <h1 text-3xl font-900>CozyMoney</h1>

        <p mt-3 text-cm-muted dark:text-cm-dark-muted>금융 정보와 계산기를 한곳에서</p>
      </section>
    </main>
  </div>
</template>
