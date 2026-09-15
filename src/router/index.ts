import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),

  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
    },

    {
      path: '/stock/',
      name: 'stock',
      component: () => import('../pages/CategoryPage.vue'),
      props: {
        category: 'stock',
      },
    },

    {
      path: '/tax/',
      name: 'tax',
      component: () => import('../pages/CategoryPage.vue'),
      props: {
        category: 'tax',
      },
    },

    {
      path: '/accounting/',
      name: 'accounting',
      component: () => import('../pages/CategoryPage.vue'),
      props: {
        category: 'accounting',
      },
    },

    {
      path: '/stock/page/:page(\\d+)/',
      name: 'stock-page',
      component: () => import('../pages/CategoryPage.vue'),
      props: (route) => ({
        category: 'stock',
        page: Number(route.params.page),
      }),
    },

    {
      path: '/tax/page/:page(\\d+)/',
      name: 'tax-page',
      component: () => import('../pages/CategoryPage.vue'),
      props: (route) => ({
        category: 'tax',
        page: Number(route.params.page),
      }),
    },

    {
      path: '/accounting/page/:page(\\d+)/',
      name: 'accounting-page',
      component: () => import('../pages/CategoryPage.vue'),
      props: (route) => ({
        category: 'accounting',
        page: Number(route.params.page),
      }),
    },

    {
      path: '/stock/:slug/',
      name: 'stock-post',
      component: () => import('../pages/PostPage.vue'),
      props: (route) => ({
        category: 'stock',
        slug: String(route.params.slug),
      }),
    },

    {
      path: '/tax/:slug/',
      name: 'tax-post',
      component: () => import('../pages/PostPage.vue'),
      props: (route) => ({
        category: 'tax',
        slug: String(route.params.slug),
      }),
    },

    {
      path: '/accounting/:slug/',
      name: 'accounting-post',
      component: () => import('../pages/PostPage.vue'),
      props: (route) => ({
        category: 'accounting',
        slug: String(route.params.slug),
      }),
    },

    {
      path: '/calculators/loan',
      name: 'loan',
      component: () => import('../pages/calculators/LoanPage.vue'),
    },

    {
      path: '/calculators/savings',
      name: 'savings',
      component: () => import('../pages/calculators/SavingsPage.vue'),
    },

    {
      path: '/calculators/salary',
      name: 'salary',
      component: () => import('../pages/calculators/SalaryPage.vue'),
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/NotFoundPage.vue'),
    },
  ],
})

export default router
