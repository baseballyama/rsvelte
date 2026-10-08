# Writing the site

For substantial explanation pages, use [site-writing](../../.claude/skills/site-writing/SKILL.md).

Every page has Japanese and English text. The rules for both are in [site-i18n](../../docs/site-i18n.md):
each route has `page.ja.svelte` and `page.en.svelte` behind a small `+page.svelte`; shared text uses
`bilingual(ja, en)`; English site links start with `/en`. Use common words and short sentences in both languages. Describe what
each module does before showing its implementation name. Do not use abbreviations in prose,
headings, navigation, captions, controls, or labels. Use the full word or a clear description.
AST and HIR are allowed technical terms; define them at their first use on a page. English may also
use the exact format and encoding names CSS, HTML, JSON, UTF-8, UTF-16, and ASCII (the list is in
`scripts/english.mjs`), each explained at its first use on a page.
This includes quoted code: rename project-defined files, modules, types,
fields and variables in the implementation, then update their references and excerpts.
`Term` supplies an explanation in the reader's language; it must not hide an abbreviated implementation name.
Keep quoted source code exact. Rust keywords, Cargo's required layout, external library names,
language syntax and public protocol field names must retain their specified spelling.

Avoid jargon, metaphors, vague claims, and promotional language. Explain a mechanism with
its input, operation, and result. Do not invent a new term for a familiar action.

Run `pnpm run lint:code-names`, `pnpm run lint:prose`, `pnpm run lint:english`, `pnpm run test`, `pnpm run check`,
and `pnpm run build` after edits. `lint:english` checks English patterns and finds Japanese text that an English
reader would see; allowed Japanese is listed with a reason in `scripts/japanese-allowlist.json`. The build checks
that the prerendered English pages exist (`scripts/check-prerender.mjs`).
The test and build commands enforce the writing rules, including in the existing site job.
Do not suppress findings or add a baseline for existing bad prose; rewrite the text.

The code-name guard checks every first-party Rust source file and its path, plus declarations
in the site's TypeScript and Svelte scripts, not just the subset quoted by the guide.
It skips comments and string literals because these may contain
source-language examples or protocol keys. Add new shortened forms and their full words to
`scripts/code-names.mjs` when they are found; no suppression baseline is allowed.

The rules use [Japanese technical writing](https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing),
[AI writing patterns](https://github.com/textlint-ja/textlint-rule-preset-ai-writing), and
[prh](https://github.com/textlint-rule/textlint-rule-prh). The configuration is `.textlintrc.cjs`;
the terminology dictionary is `writing.yml`. The extractor uses the Svelte and TypeScript
parsers. It checks visible static text and reader-facing strings, but does not evaluate
runtime expressions or rewrite quoted code. Review dynamic labels when adding them.
It preserves emphasis, heading levels and list markers for the AI pattern rules.
Rules that need adjacent blocks still need manual review because passages are checked separately.

Fragments include headings and controls, so sentence-final punctuation and tone rules are
disabled. Question marks are allowed in teaching. Number style is not a readability gate.
The repeated-particle rule flags normal Japanese enumeration; comma limits flag numeric
thousands separators. The Japanese comma limit remains enabled. Advisory writing guidance
is disabled because it requires human judgment; concrete pattern rules fail the build.
