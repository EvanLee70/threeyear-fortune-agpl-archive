import { useSyncExternalStore } from 'react'
import { localeStore } from './store.ts'
import type { Locale } from './store.ts'
import ko from './locales/ko.ts'
import zh from './locales/zh.ts'
import ja from './locales/ja.ts'
import en from './locales/en.ts'
import { withHanja } from '../utils/hanja.ts'

export type { Locale }

// 한국어 화면 라벨의 사주 용어는 한글(漢字)로 병기한다.
const koHanja = Object.fromEntries(Object.entries(ko).map(([key, text]) => [key, withHanja(text)]))
const messages: Record<Locale, Record<string, string>> = { ko: koHanja, zh, ja, en }

export function useLocale() {
  const locale = useSyncExternalStore(localeStore.subscribe, localeStore.getSnapshot)
  return {
    locale,
    setLocale: localeStore.setLocale,
    t: (key: string) => messages[locale][key] ?? key,
  }
}

/** Non-hook version for use outside React components (e.g., text-export) */
export function t(locale: Locale, key: string): string {
  return messages[locale][key] ?? key
}

export function getLocale(): Locale {
  return localeStore.getSnapshot()
}
