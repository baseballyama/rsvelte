# Writing the site

Write the site in English for frontend engineers. Follow the `docs` skill
(`.claude/skills/docs/SKILL.md`); this file lists only what is specific to the site.

- Keep each page short. A fact belongs to one page; link to it from the others.
- Check each fact against the code or `apps/cli/README.md`. Do not state a number that the
  build does not compute.

## Checks

```sh
pnpm run lint:prose [file ...]   # the English check of tools/writing on the visible text
pnpm run lint:code-names         # shortened names in Rust and the site's own declarations
pnpm run test && pnpm run check && pnpm run build
```

`test` and `build` run both lints. Rewrite the text to fix a finding. Do not suppress it or add
a baseline.

The extractor (`scripts/prose.ts`) parses Svelte and TypeScript. It reads the visible static
text of the templates, and the `title`, `label` and `message` strings in scripts. It does not
run expressions, so review dynamic text yourself. The check reads each page as one Markdown
document. It does not look inside inline code.

The code-name guard reads every first-party Rust file and path, and the declarations in the
site's TypeScript and Svelte. It skips comments and string literals, which may quote another
language. Add a newly found shortened name and its full word to `scripts/code-names.ts`.
