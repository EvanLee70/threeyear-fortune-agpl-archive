// 3개년운세 스냅샷 리포트 — 올해·내년·내후년 연운을 하나의 마크다운으로 생성.
// 화면(ThreeYearView)과 동일한 결정론 계산·서사 생성기(core.ts)를 사용한다.
import type { BirthInput } from '@orrery/core/types'
import { scoreBandLabel } from './core.ts'
import { ascSignOf, computeThreeYear, computeYear, type YearResult } from './compute.ts'

const FAIL = '사주 계산에 실패했습니다. 입력을 확인해 주세요.'

/** 한 해 분량의 마크다운 섹션(①~⑤) */
function buildYearSection(y: YearResult): string[] {
  const { zodiac: z, months, caution } = y
  const out: string[] = []
  out.push(
    `## ${y.label} — ${y.targetYear}년 ${y.yearStem}${y.yearBranch}년${y.samjae ? ` (⚠️ ${y.samjae})` : ''}`,
    '',
    `### ① 종합운 — 세운 ${y.yearStem}${y.yearBranch} · ${y.tenGod} · 종합 ${y.overall}점(${scoreBandLabel(y.overall)})`,
    '',
    y.overallNarrative,
    '',
    '### ② 주제별 운세 (관심 순위 순)',
    '',
  )
  for (const t of y.themes) {
    out.push(`#### ${t.rank}위 ${t.emoji} ${t.key} — ${t.score}점 (${scoreBandLabel(t.score)})`, '', t.narrative, '')
  }
  out.push(
    `### ③ 별자리 연운 — ${z.def.symbol} ${z.def.ko} ${z.isAsc ? 'ASC(상승궁) 기준' : '태양궁 기준'} · ${z.score}점`,
    '',
    `절정의 달 ${z.peak}월 · 숨 고르기 ${z.low}월. ${z.score >= 60 ? '이미지 변신과 대외 활동을 넓히기 좋은 해입니다.' : '노출보다 기반을 다지는 편이 유리한 해입니다.'}`,
    '',
    '### ④ 월별 흐름',
    '',
    `| 월 | 월주 | 총평 | 점수 | 키워드 |`,
    `|:--:|:--:|:--:|:--:|:--|`,
    ...months.map((m) => `| ${m.month}월 | ${m.monthPillar} | ${m.fortune.overall} | ${m.fortune.score} | ${m.characteristics.keywords.slice(0, 3).join(' · ')} |`),
    '',
    '### ⑤ 조심해야 할 점',
    '',
  )
  if (caution.intro) out.push(`> ⚠️ ${caution.intro}`, '')
  out.push(...caution.donts.map((d) => `- ${d}`), `- ${caution.worstLine}`, '')
  return out
}

/** 올해·내년·내후년 3개년 연운 마크다운 리포트 (스냅샷 저장용 — 기존 동작·출력 그대로 유지) */
export async function generateThreeYearReport(input: BirthInput, name: string): Promise<string> {
  const r = await computeThreeYear(input, name)
  if (!r) throw new Error(FAIL)
  const baseYear = r.baseYear
  const out: string[] = [
    `# 🔮 ${name} 3개년운세 (${baseYear}~${baseYear + 2})`,
    '',
    '사주명리(세운·월운) 중심 — 종합운 → 관심사 순위(재물→직장→연애→건강) → ASC 별자리 연운 → 월별 흐름 → 조심할 점. 전부 결정론 계산.',
    '',
  ]
  for (const y of r.years) out.push(...buildYearSection(y))
  out.push('---', '', '⚠️ 참고·재미용 콘텐츠입니다. 실제 삶의 결과를 보장하지 않습니다.')
  return out.join('\n')
}

/** 레포트 생성(📜) 전용 — 오프셋 하나(0=올해·1=내년·2=내후년)만의 마크다운 섹션 */
export async function generateThreeYearOffsetReport(input: BirthInput, name: string, offset: number): Promise<string> {
  const y = computeYear(input, name, offset, await ascSignOf(input))
  if (!y) throw new Error(FAIL)
  return buildYearSection(y).join('\n')
}
