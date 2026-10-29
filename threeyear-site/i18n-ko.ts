// 단독 사이트용 i18n 대체 모듈 — vite.threeyear.config.ts 의 alias 가 src/i18n/index.ts 대신 이 파일을 쓰게 한다.
// 원본은 localStorage 에서 언어를 읽고 쓰며 4개 언어를 번들에 싣는다. 사이트는 한국어 고정이라 저장소 접근이 없다.
import ko from '../src/i18n/locales/ko.ts'
import { withHanja } from '../src/utils/hanja.ts'

const messages: Record<string, string> = Object.fromEntries(
  Object.entries(ko).map(([key, text]) => [key, withHanja(text)]),
)

export function useLocale() {
  return { locale: 'ko' as const, setLocale: () => {}, t: (key: string): string => messages[key] ?? key }
}
