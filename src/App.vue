<script setup lang="ts">
import { computed, ref } from 'vue'
import { loan, deposit, installment, type RepaymentType } from './calculators/math'

type Kind='loan'|'savings'|'salary'|'hourly-wage'|'installment-savings'
const path=ref(typeof window==='undefined'?'/' : (location.pathname.replace(/\/+$/,'')||'/'))
const kind=computed<Kind>(()=>{const m=path.value.match(/^\/calculators\/(.+)$/); return (m?.[1] as Kind)||'loan'})
const amount=ref(10000000), rate=ref(4), months=ref(120), grace=ref(0), repayment=ref<RepaymentType>('equal')
const principal=ref(10000000), savingsRate=ref(3), savingsMonths=ref(12)
const salary=ref(3000000), hours=ref(209), hourly=ref(10320)
const result=computed(()=>{
 if(kind.value==='loan') return loan(amount.value,rate.value,months.value,repayment.value,grace.value)
 if(kind.value==='savings') return deposit(principal.value,savingsRate.value,savingsMonths.value,'general')
 if(kind.value==='installment-savings') return installment(principal.value,savingsRate.value,savingsMonths.value,'general')
 return { monthly: kind.value==='salary'?salary.value:hourly.value*hours.value, total:0 }
})
function money(v:number){return new Intl.NumberFormat('ko-KR').format(Math.round(v))+'원'}
function step(v:typeof amount,n:number,d:number,min=0){v.value=Math.max(min,v.value+d)}
function nav(p:string){history.pushState({},'',p);path.value=p}
if(typeof window!=='undefined') addEventListener('popstate',()=>path.value=location.pathname.replace(/\/+$/,'')||'/')
</script>
<template>
  <div min-h-screen bg-cm-bg dark:bg-cm-dark-bg text-cm-text dark:text-cm-dark-text>
    <header border-b border-cm-line dark:border-cm-dark-line bg-cm-surface dark:bg-cm-dark-surface>
      <div page flex items-center justify-between gap-4 py-4>
        <a href="/" @click.prevent="nav('/')" flex items-center gap-2 font-900 text-xl text-cm-primary dark:text-cm-dark-primary>CozyMoney</a>
        <nav flex flex-wrap justify-end gap-2 text-sm font-700>
          <a href="/stock/" @click.prevent="nav('/stock/')" p-2>주식</a><a href="/tax/" @click.prevent="nav('/tax/')" p-2>세금</a><a href="/accounting/" @click.prevent="nav('/accounting/')" p-2>재무회계</a>
          <a href="/calculators/loan" @click.prevent="nav('/calculators/loan')" p-2>대출</a><a href="/calculators/savings" @click.prevent="nav('/calculators/savings')" p-2>예금</a><a href="/calculators/installment-savings" @click.prevent="nav('/calculators/installment-savings')" p-2>적금</a><a href="/calculators/salary" @click.prevent="nav('/calculators/salary')" p-2>월급</a><a href="/calculators/hourly-wage" @click.prevent="nav('/calculators/hourly-wage')" p-2>시급</a>
        </nav>
      </div>
    </header>
    <main page py-8>
      <section v-if="path==='/'" surface p-8 text-center><h1 text-3xl font-900>CozyMoney</h1><p mt-3 text-cm-muted dark:text-cm-dark-muted>금융 정보와 계산기</p></section>
      <section v-else-if="path.startsWith('/calculators/')" surface mx-auto max-w-800px p-5 sm:p-8>
        <h1 text-2xl font-900>{{kind==='loan'?'대출 계산기':kind==='savings'?'예금 계산기':kind==='installment-savings'?'적금 계산기':kind==='salary'?'월급 계산기':'시급 계산기'}}</h1>
        <div mt-7 grid gap-5>
          <label v-if="kind==='loan'" grid gap-2><span font-800>대출금액</span><div grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] gap-1.5><button @click="amount=Math.max(0,amount-1000000)" h-10 rounded-lg border>−</button><input v-model.number="amount" inputmode="numeric" h-10 w-full rounded-lg border border-cm-line bg-white px-3 text-right font-700 text-[#18212b] dark:text-[#18212b] outline-none focus:border-cm-accent><button @click="amount+=1000000" h-10 rounded-lg border>＋</button></div></label>
          <label v-if="kind==='loan'" grid gap-2><span font-800>연 이율 (%)</span><input v-model.number="rate" type="number" step="0.1" h-10 rounded-lg border border-cm-line bg-white px-3 text-right font-700 text-[#18212b] dark:text-[#18212b] outline-none focus:border-cm-accent></label>
          <label v-if="kind==='loan'" grid gap-2><span font-800>대출기간 (개월)</span><input v-model.number="months" type="number" h-10 rounded-lg border border-cm-line bg-white px-3 text-right font-700 text-[#18212b] dark:text-[#18212b] outline-none focus:border-cm-accent></label>
          <label v-if="kind==='loan'" grid gap-2><span font-800>거치기간 (개월)</span><input v-model.number="grace" type="number" h-10 rounded-lg border border-cm-line bg-white px-3 text-right font-700 text-[#18212b] dark:text-[#18212b] outline-none focus:border-cm-accent></label>
          <label v-if="kind==='loan'" grid gap-2><span font-800>상환방식</span><select v-model="repayment" h-10 rounded-lg border bg-white px-3 text-[#18212b]"><option value="equal">원리금균등</option><option value="principal">원금균등</option><option value="lump">만기일시</option></select></label>
          <label v-if="kind==='savings'||kind==='installment-savings'" grid gap-2><span font-800>{{kind==='savings'?'예치금액':'월 납입액'}}</span><input v-model.number="principal" type="number" h-10 rounded-lg border bg-white px-3 text-right font-700 text-[#18212b] dark:text-[#18212b]"></label>
          <label v-if="kind==='savings'||kind==='installment-savings'" grid gap-2><span font-800>연 이율 (%)</span><input v-model.number="savingsRate" type="number" step="0.1" h-10 rounded-lg border bg-white px-3 text-right font-700 text-[#18212b] dark:text-[#18212b]"></label>
          <label v-if="kind==='savings'||kind==='installment-savings'" grid gap-2><span font-800>기간 (개월)</span><input v-model.number="savingsMonths" type="number" h-10 rounded-lg border bg-white px-3 text-right font-700 text-[#18212b] dark:text-[#18212b]"></label>
          <label v-if="kind==='salary'" grid gap-2><span font-800>월급</span><input v-model.number="salary" type="number" h-10 rounded-lg border bg-white px-3 text-right font-700 text-[#18212b] dark:text-[#18212b]"></label>
          <label v-if="kind==='hourly-wage'" grid gap-2><span font-800>시급</span><input v-model.number="hourly" type="number" h-10 rounded-lg border bg-white px-3 text-right font-700 text-[#18212b] dark:text-[#18212b]"></label>
          <div mt-2 rounded-2xl bg-cm-surface2 dark:bg-cm-dark-surface2 p-5><div text-sm text-cm-muted dark:text-cm-dark-muted>계산 결과</div><div mt-2 text-2xl font-900>{{money(('monthly' in result ? result.monthly : result.maturity ?? result.totalPayment ?? 0) as number)}}</div></div>
        </div>
      </section>
      <section v-else surface p-8><h1 text-2xl font-900>CozyMoney</h1><p mt-3>해당 페이지</p></section>
    </main>
  </div>
</template>
