# Writing the site

Write the site in Japanese for frontend engineers. Follow the `docs` skill
(`.claude/skills/docs/SKILL.md`); this file lists only what is specific to the site.

- Say what a module does before you show its implementation name.
- Use well-known acronyms (`acronyms` in `tools/writing/words.ts`) as they are, and define AST
  and HIR at their first use on a page. Spell out every other acronym and shortened name.
  Rename shortened project names in the code too, then update the quoted excerpts.
- `Term` adds a Japanese explanation to a word. It must not hide a shortened name.
- Keep quoted code exact. Rust keywords, Cargo's layout, library names, language syntax and
  public protocol fields keep their own spelling.
- A comparison names the other tool's relevant feature and links its official page, with the
  date you checked it. A cache claim says when the value expires.
- Animation must not suggest a measured speed, and the text must work with motion turned off.

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
