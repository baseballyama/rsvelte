# Writing the site

Use Japanese for reader-facing text. Use common words and short sentences. Describe what
each module does before showing its implementation name. Do not use abbreviations in prose,
headings, navigation, captions, controls, or labels. Use the full word or a clear Japanese
description. This includes quoted code: rename project-defined files, modules, types,
fields and variables in the implementation, then update their references and excerpts.
`Term` supplies a Japanese explanation; it must not hide an abbreviated implementation name.
Keep quoted source code exact. Rust keywords, Cargo's required layout, external library names,
language syntax and public protocol field names must retain their specified spelling.

Avoid jargon, metaphors, vague claims, and promotional language. Explain a mechanism with
its input, operation, and result. Do not invent a new term for a familiar action.

Run `pnpm run lint:code-names`, `pnpm run lint:prose`, `pnpm run test`, `pnpm run check`, and `pnpm run build` after edits.
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

Fragments include headings and controls, so sentence-final punctuation and tone rules are
disabled. Question marks are allowed in teaching. Number style is not a readability gate.
The repeated-particle rule flags normal Japanese enumeration; comma limits flag numeric
thousands separators. The Japanese comma limit remains enabled. Advisory writing guidance
is disabled because it requires human judgment; concrete pattern rules fail the build.
