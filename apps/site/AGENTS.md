# Writing the site

Write the site in Japanese for frontend engineers. Follow the `docs` skill
(`.claude/skills/docs/SKILL.md`); this file lists only what is specific to the site.

- Keep each page short. A fact belongs to one page; link to it from the others.
- Check each fact against the code or `apps/cli/README.md`. Do not state a number that the
  build does not compute.
- Use well-known acronyms (`acronyms` in `tools/writing/words.ts`) as they are. Write any other
  name as code, or spell it out.

## Checks

```sh
pnpm run lint:prose [file ...]   # textlint on the visible Japanese text
pnpm run lint:code-names         # shortened names in Rust and the site's own declarations
pnpm run test && pnpm run check && pnpm run build
```

`test` and `build` run both lints. Rewrite the text to fix a finding. Do not suppress it or add
a baseline.

The textlint rules are in `.textlintrc.json`, and `writing.yml` lists terms to replace. The
`no-abbreviations` rule is in `scripts/no-abbreviations.ts`. The extractor
(`scripts/prose.ts`) parses Svelte and TypeScript and checks visible static text and reader
strings. It does not run expressions, so review dynamic labels yourself. textlint sees one
passage at a time, so read the whole page for rules that span paragraphs.

Rules turned off, and why:

- Sentence-final punctuation and tone: headings and buttons are fragments.
- Question marks: questions help teaching.
- Number style (`一つ` or `1つ`): it does not change readability.
- Commas in English sentences: they count thousands separators. The Japanese comma limit stays on.
- The repeated-particle rule allows も, や, か and と, because normal Japanese lists repeat them.
- Advisory AI-writing guidance: it needs a person's judgment. The concrete AI-pattern rules stay on.
- Hiragana for adverbs (`ja-hiragana-fukushi`): it asks to write 正しく as まさしく.

The code-name guard reads every first-party Rust file and path, and the declarations in the
site's TypeScript and Svelte. It skips comments and string literals, which may quote another
language. Add a newly found shortened name and its full word to `scripts/code-names.ts`.
