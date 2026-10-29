import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BirthInput } from '@orrery/core/types'
import { seededSeq } from './core.ts'
import { computeThreeYear, computeYear } from './compute.ts'
import { calculateSaju } from '../vendor/fortuneteller/lib/saju.ts'
import { generateThreeYearReport, generateThreeYearOffsetReport } from './report.ts'
import golden from './__fixtures__/golden.json'

const NOW = new Date('2026-10-29T12:00:00+09:00')
const INPUTS: BirthInput[] = [
  { year: 1985, month: 3, day: 14, hour: 9, minute: 30, gender: 'M' },
  { year: 1990, month: 2, day: 4, hour: 0, minute: 10, gender: 'F' },
  { year: 2000, month: 12, day: 31, hour: 23, minute: 50, gender: 'M', unknownTime: true },
]

// vendor analyzeYearlyWolun 이 주제별 월 점수에 Math.random 을 쓴다 → golden 은 시드 난수로 고정해 비교한다.
// (golden.json 은 리팩터링 전 report.ts(HEAD)를 같은 시드·시계로 돌려 만들었다.)
const seeded = async <T,>(fn: () => Promise<T>) => {
  vi.spyOn(Math, 'random').mockImplementation(seededSeq(20261029))
  try { return await fn() } finally { vi.restoreAllMocks() }
}

describe('computeThreeYear', () => {
  it('정상 입력: 3개 연도, 12개월, 4개 주제, 점수 범위', async () => {
    const r = await computeThreeYear(INPUTS[0], '테스트', NOW)
    expect(r).not.toBeNull()
    expect(r!.baseYear).toBe(2026)
    expect(r!.years.map((y) => y.targetYear)).toEqual([2026, 2027, 2028])
    expect(r!.years.map((y) => y.label)).toEqual(['올해', '내년', '내후년'])
    for (const y of r!.years) {
      expect(y.months).toHaveLength(12)
      expect(y.themes.map((t) => t.rank)).toEqual([1, 2, 3, 4])
      expect(y.overall).toBeGreaterThanOrEqual(0)
      expect(y.overall).toBeLessThanOrEqual(100)
      expect(y.zodiac.score).toBeGreaterThanOrEqual(45)
      expect(y.zodiac.score).toBeLessThanOrEqual(85)
      expect(y.zodiac.peak).toBeGreaterThanOrEqual(1)
      expect(y.zodiac.low).toBeLessThanOrEqual(12)
      expect(y.overallNarrative.length).toBeGreaterThan(0)
    }
    expect(r!.years[0].yearStem + r!.years[0].yearBranch).toBe('병오')
  })

  it('today 인자가 기준 연도를 정한다', async () => {
    const a = await computeThreeYear(INPUTS[0], '테스트', NOW)
    const b = await computeThreeYear(INPUTS[0], '테스트', NOW)
    const c = await computeThreeYear(INPUTS[0], '테스트', new Date('2030-05-01T00:00:00+09:00'))
    expect(a!.years.map((y) => y.overallNarrative.slice(0, 40))).toEqual(b!.years.map((y) => y.overallNarrative.slice(0, 40)))
    expect(c!.years[0].targetYear).toBe(2030)
  })

  it('시각 미상이면 정오 기준으로 계산되고 별자리는 ASC 아니면 태양궁 폴백', async () => {
    const r = await computeThreeYear(INPUTS[2], '테스트', NOW)
    expect(r!.years[0].zodiac.def.ko).toBeTruthy()
  })

  it('computeYear: ASC 없음(null)이면 태양궁 폴백', () => {
    const y = computeYear(INPUTS[0], '테스트', 0, null, NOW)
    expect(y!.zodiac.isAsc).toBe(false)
    expect(y!.zodiac.def.key).toBe('PISCES')
  })

  it('난수 없음: 시드 없이 두 번 계산해도 월별·주제별 점수가 같다', async () => {
    const a = await computeThreeYear(INPUTS[0], '테스트', NOW)
    const b = await computeThreeYear(INPUTS[0], '테스트', NOW)
    expect(a!.years.map((y) => y.months.map((m) => m.fortune))).toEqual(b!.years.map((y) => y.months.map((m) => m.fortune)))
  })

  it('2026 월운은 절기 기준 월주 (1월=기축 … 2월=경인 … 12월=경자)', async () => {
    const r = await computeThreeYear(INPUTS[0], '테스트', NOW)
    expect(r!.years[0].months.map((m) => m.monthPillar)).toEqual(
      ['기축', '경인', '신묘', '임진', '계사', '갑오', '을미', '병신', '정유', '무술', '기해', '경자'])
  })

  it('시주는 KST 벽시계 기준 (09:30 → 사시 을사, 진태양시 32분 보정 안 함)', () => {
    const t = (time: string) => calculateSaju('1985-03-14', time, 'solar', false, 'male', '표준시').hour
    expect(t('09:30')).toMatchObject({ stem: '을', branch: '사' }) // same as the core pillar table (乙巳)
    expect(t('08:59')).toMatchObject({ branch: '진' })
    expect(t('09:00')).toMatchObject({ branch: '사' })
  })

  it('빈/누락 입력은 예외 없이 null', async () => {
    expect(await computeThreeYear({} as BirthInput, '', NOW)).toBeNull()
    expect(computeYear({} as BirthInput, '', 0, null, NOW)).toBeNull()
  })

  it('잘못된 입력(13월, 40일)은 예외 없이 null', async () => {
    expect(await computeThreeYear({ ...INPUTS[0], month: 13 }, '테스트', NOW)).toBeNull()
    expect(await computeThreeYear({ ...INPUTS[0], day: 40 }, '테스트', NOW)).toBeNull()
  })
})

describe('golden: 리팩터링 전 리포트와 바이트 단위로 동일', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW) })
  afterEach(() => { vi.useRealTimers() })

  INPUTS.forEach((input, i) => {
    it(`입력 #${i + 1} 전체 리포트·오프셋별 리포트`, async () => {
      const g = golden[i]
      expect(await seeded(() => generateThreeYearReport(input, '테스트'))).toBe(g.full)
      expect(await seeded(() => generateThreeYearOffsetReport(input, '테스트', 0))).toBe(g.o0)
      expect(await seeded(() => generateThreeYearOffsetReport(input, '테스트', 1))).toBe(g.o1)
      expect(await seeded(() => generateThreeYearOffsetReport(input, '테스트', 2))).toBe(g.o2)
    })
  })

  it('잘못된 입력은 리포트에서 예외 (기존 동작)', async () => {
    await expect(generateThreeYearReport({ ...INPUTS[0], month: 13 }, '테스트')).rejects.toThrow()
  })
})
