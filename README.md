> **Archived.** This is the source of the AGPL-3.0 version of the site that was served until 2026-10-30.
> The site now runs an MIT-licensed rewrite: https://github.com/EvanLee70/threeyear-fortune
> This repository stays public and read-only so that the source of the old version remains available.

# threeyear-fortune

A free, stateless 3-year fortune (saju, 사주) calculator for Korean users.
Enter a birth date and time (solar or lunar). The page shows the four pillars and compares this year, next year, and the year after in three columns.

**For fun and reference only.** The result is not a guarantee. Do not use it alone for medical, financial, or legal decisions.

## Privacy

- All calculation runs in the browser. There is no server and no API.
- The page does not store birth data: no `localStorage`, no cookies, no analytics, no network request after load.
- The Korean web font is self-hosted. No third-party font request is made.

## Source code (AGPL-3.0)

This repository is the complete corresponding source of the running site (GNU AGPL v3, section 13).
The footer of the site links here.

## Develop

```bash
npm ci
npm run dev      # local dev server
npm test         # vitest
npm run build    # tsc -b && vite build -> dist/
```

## Layout

| Path | Content |
|---|---|
| `threeyear-site/` | The site: form, pillar table, 3-column comparison, charts |
| `src/threeyear/` | Pure calculation core (deterministic, no DOM) and its golden tests |
| `src/vendor/fortuneteller/` | Vendored saju engine (MIT), see its `LICENSE` |
| `packages/core/` | Calendar, saju, and natal-chart engine from `rath/orrery` (AGPL-3.0) |

## Credits and licenses

- This repository: AGPL-3.0-only (`LICENSE`).
- `packages/core/src`: from [rath/orrery](https://github.com/rath/orrery) (`@orrery/core`, AGPL-3.0). Its saju calendar traces back to the "진짜만세력" by Go Young-chang, ported by Kim Jung-gyun and Hwang Jang-ho.
- `src/vendor/fortuneteller`: from [hjsh200219/fortuneteller](https://github.com/hjsh200219/fortuneteller) (MIT, Hoshin), upstream commit `844d9f6`, with local edits listed in its `LICENSE`.
- Lunar-solar conversion: [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) (MIT).
- Font: Noto Sans KR (SIL OFL 1.1).
