<script setup lang="ts">
import { computed, ref } from 'vue'
import { deposit, installment, loan, type RepaymentType } from '../calculators/math'

type CalculatorKind = 'loan' | 'savings' | 'salary'

type SavingsMode = 'deposit' | 'installment'

type IncomeMode = 'salary' | 'hourly'

const props = defineProps<{
  kind: CalculatorKind
}>()

const savingsMode = ref<SavingsMode>('deposit')
const incomeMode = ref<IncomeMode>('salary')

const amount = ref(10_000_000)
const rate = ref(4)
const months = ref(120)
const grace = ref(0)
const repayment = ref<RepaymentType>('equal')

const principal = ref(10_000_000)
const savingsRate = ref(3)
const savingsMonths = ref(12)

const salary = ref(3_000_000)
const hours = ref(209)
const hourly = ref(10_320)

const title = computed(() => {
  switch (props.kind) {
    case 'loan':
      return '대출 계산기'

    case 'savings':
      return '예금·적금 계산기'

    case 'salary':
      return '월급·시급 계산기'

    default:
      return ''
  }
})

const result = computed(() => {
  if (props.kind === 'loan') {
    return loan(amount.value, rate.value, months.value, repayment.value, grace.value)
  }

  if (props.kind === 'savings') {
    if (savingsMode.value === 'deposit') {
      return deposit(principal.value, savingsRate.value, savingsMonths.value, 'general')
    }

    return installment(principal.value, savingsRate.value, savingsMonths.value, 'general')
  }

  if (incomeMode.value === 'salary') {
    return {
      monthly: salary.value,
      total: salary.value * 12,
    }
  }

  return {
    monthly: hourly.value * hours.value,
    total: hourly.value * hours.value * 12,
  }
})

const resultValue = computed(() => {
  const value = result.value

  if ('monthly' in value && typeof value.monthly === 'number') {
    return value.monthly
  }

  if ('maturity' in value && typeof value.maturity === 'number') {
    return value.maturity
  }

  if ('totalPayment' in value && typeof value.totalPayment === 'number') {
    return value.totalPayment
  }

  if ('total' in value && typeof value.total === 'number') {
    return value.total
  }

  return 0
})

function money(value: number) {
  return `${new Intl.NumberFormat('ko-KR').format(Math.round(value))}원`
}
</script>

<template>
  <section surface mx-auto max-w-800px p-5 sm:p-8>
    <h1 text-2xl font-900>
      {{ title }}
    </h1>

    ```
    <!-- 대출 계산기 -->
    <div v-if="kind === 'loan'" mt-7 grid gap-5>
      <label grid gap-2>
        <span font-800> 대출금액 </span>

        <div grid grid-cols="[2.5rem_minmax(0,1fr)_2.5rem]" gap-1.5>
          <button
            h-10
            rounded-lg
            border
            type="button"
            active-scale-0.95
            @click="amount = Math.max(0, amount - 1_000_000)"
          >
            −
          </button>

          <input
            v-model.number="amount"
            inputmode="numeric"
            h-10
            w-full
            rounded-lg
            border
            border-cm-line
            bg-white
            px-3
            text-right
            font-700
            text-[#18212b]
            outline-none
            focus:border-cm-accent
          />

          <button
            h-10
            rounded-lg
            border
            type="button"
            active-scale-0.95
            @click="amount += 1_000_000"
          >
            +
          </button>
        </div>
      </label>

      <label grid gap-2>
        <span font-800> 대출금리 (%) </span>

        <input
          v-model.number="rate"
          type="number"
          step="0.1"
          h-10
          rounded-lg
          border
          border-cm-line
          bg-white
          px-3
          text-right
          font-700
          text-[#18212b]
          outline-none
          focus:border-cm-accent
        />
      </label>

      <label grid gap-2>
        <span font-800> 대출기간 (개월) </span>

        <input
          v-model.number="months"
          type="number"
          min="1"
          h-10
          rounded-lg
          border
          border-cm-line
          bg-white
          px-3
          text-right
          font-700
          text-[#18212b]
          outline-none
          focus:border-cm-accent
        />
      </label>

      <label grid gap-2>
        <span font-800> 거치기간 (개월) </span>

        <input
          v-model.number="grace"
          type="number"
          min="0"
          h-10
          rounded-lg
          border
          border-cm-line
          bg-white
          px-3
          text-right
          font-700
          text-[#18212b]
          outline-none
          focus:border-cm-accent
        />
      </label>

      <label grid gap-2>
        <span font-800> 상환방식 </span>

        <select v-model="repayment" h-10 rounded-lg border bg-white px-3 text-[#18212b]>
          <option value="equal">원리금균등</option>

          <option value="principal">원금균등</option>

          <option value="lump">만기일시</option>
        </select>
      </label>
    </div>

    <!-- 예금·적금 계산기 -->
    <div v-else-if="kind === 'savings'" mt-7 grid gap-5>
      <div grid grid-cols-2 gap-2 rounded-xl bg-cm-surface2 p-1 dark:bg-cm-dark-surface2>
        <button
          rounded-lg
          px-4
          py-2.5
          font-800
          active-scale-0.95
          :class="
            savingsMode === 'deposit'
              ? 'bg-cm-primary text-white'
              : 'text-cm-text dark:text-cm-dark-text'
          "
          @click="savingsMode = 'deposit'"
        >
          예금
        </button>

        <button
          rounded-lg
          px-4
          py-2.5
          font-800
          active-scale-0.95
          :class="
            savingsMode === 'installment'
              ? 'bg-cm-primary text-white'
              : 'text-cm-text dark:text-cm-dark-text'
          "
          @click="savingsMode = 'installment'"
        >
          적금
        </button>
      </div>

      <label grid gap-2>
        <span font-800>
          {{ savingsMode === 'deposit' ? '예치금액' : '월 납입금액' }}
        </span>

        <input
          v-model.number="principal"
          type="number"
          min="0"
          h-10
          rounded-lg
          border
          border-cm-line
          bg-white
          px-3
          text-right
          font-700
          text-[#18212b]
          outline-none
          focus:border-cm-accent
        />
      </label>

      <label grid gap-2>
        <span font-800> 금리 (%) </span>

        <input
          v-model.number="savingsRate"
          type="number"
          min="0"
          step="0.1"
          h-10
          rounded-lg
          border
          border-cm-line
          bg-white
          px-3
          text-right
          font-700
          text-[#18212b]
          outline-none
          focus:border-cm-accent
        />
      </label>

      <label grid gap-2>
        <span font-800> 기간 (개월) </span>

        <input
          v-model.number="savingsMonths"
          type="number"
          min="1"
          h-10
          rounded-lg
          border
          border-cm-line
          bg-white
          px-3
          text-right
          font-700
          text-[#18212b]
          outline-none
          focus:border-cm-accent
        />
      </label>
    </div>

    <!-- 월급·시급 계산기 -->
    <div v-else mt-7 grid gap-5>
      <div grid grid-cols-2 gap-2 rounded-xl bg-cm-surface2 p-1 dark:bg-cm-dark-surface2>
        <button
          rounded-lg
          px-4
          py-2.5
          font-800
          active-scale-0.95
          :class="
            incomeMode === 'salary'
              ? 'bg-cm-primary text-white'
              : 'text-cm-text dark:text-cm-dark-text'
          "
          @click="incomeMode = 'salary'"
        >
          월급
        </button>

        <button
          rounded-lg
          px-4
          py-2.5
          font-800
          active-scale-0.95
          :class="
            incomeMode === 'hourly'
              ? 'bg-cm-primary text-white'
              : 'text-cm-text dark:text-cm-dark-text'
          "
          @click="incomeMode = 'hourly'"
        >
          시급
        </button>
      </div>

      <label v-if="incomeMode === 'salary'" grid gap-2>
        <span font-800> 월급 </span>

        <input
          v-model.number="salary"
          type="number"
          min="0"
          h-10
          rounded-lg
          border
          border-cm-line
          bg-white
          px-3
          text-right
          font-700
          text-[#18212b]
          outline-none
          focus:border-cm-accent
        />
      </label>

      <template v-else>
        <label grid gap-2>
          <span font-800> 시급 </span>

          <input
            v-model.number="hourly"
            type="number"
            min="0"
            h-10
            rounded-lg
            border
            border-cm-line
            bg-white
            px-3
            text-right
            font-700
            text-[#18212b]
            outline-none
            focus:border-cm-accent
          />
        </label>

        <label grid gap-2>
          <span font-800> 월 근로시간 </span>

          <input
            v-model.number="hours"
            type="number"
            min="1"
            h-10
            rounded-lg
            border
            border-cm-line
            bg-white
            px-3
            text-right
            font-700
            text-[#18212b]
            outline-none
            focus:border-cm-accent
          />
        </label>
      </template>
    </div>

    <div mt-7 rounded-2xl bg-cm-surface2 p-5 dark:bg-cm-dark-surface2>
      <div text-sm text-cm-muted dark:text-cm-dark-muted>계산 결과</div>

      <div mt-2 text-2xl font-900>
        {{ money(resultValue) }}
      </div>
    </div>
    ```
  </section>
</template>
