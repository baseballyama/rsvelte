# Writing

Checks the English prose of the repository's first-party Markdown files with textlint. It skips
text written by others, such as the corpus, copied upstream files and changelogs.

```sh
pnpm --filter @rsvelte-experimental/writing run writing             # every first-party file
pnpm --filter @rsvelte-experimental/writing run writing README.md   # only the files given
```

`pnpm run check` runs it. The rules are in `rules.ts`, and the technical words they accept are in
`words.ts`.
