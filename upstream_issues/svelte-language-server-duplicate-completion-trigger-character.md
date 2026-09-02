# `svelte-language-server` advertises `@` twice in `completionProvider.triggerCharacters`

`svelte-language-server@0.18.4` (`language-tools` `092af3826bad`), `src/server.ts:280-306`, builds
the advertised completion trigger characters as one array literal. `'@'` appears in it **twice** —
once in the main group and once again in the Emmet group:

```js
triggerCharacters: [
    '.', '"', "'", '`', '/',
    '@',            // <- server.ts:286
    '<',
    // Emmet
    '>', '*', '#', '$', '+', '^', '(', '[',
    '@',            // <- server.ts:298
    '-',
    // Svelte
    ':', '|'
]
```

The array is 19 entries over 18 distinct characters. `ServerCapabilities.completionProvider.
triggerCharacters` is a set of characters the client should fire completion on, so a repeat is
redundant rather than harmful — no client behaviour depends on the multiplicity. It is reported
because it is observable in the advertised capabilities and because anything comparing the two
servers' `initialize` responses element-wise sees it as a real difference.

## How this was measured, and why there is no server transcript

rsvelte's LSP differential gate (`scripts/compat-lsp/`) drives both servers' `initialize` and
records each differing field as one shrink-only ratchet key. The key for this field is

```
differential:fixtures/capabilities|initialize|/capabilities/completionProvider/triggerCharacters:missing-rsvelte[count=1,hash=34551d7783bc]
```

The gate stores a **digest**, never the values, so the recorded entry cannot be read back
directly. The digest is reproducible, though, and reproducing it identifies the preimage — which
running the two servers does not, since a run reports only *that* the two arrays differ.
`scripts/compat-lsp/capability-hashes.test.mjs` reconstructs `diff.mjs`'s bucketing from each
side's declared values and asserts the recorded digest:

* official's 19-entry list **with** the duplicate `@` and rsvelte's 19-entry list yield
  `count=1,hash=34551d7783bc` — the single unmatched official element is `"@"`.
* deleting either `'@'` from the official list changes the digest, so the duplicate is
  load-bearing for the recorded value and not an artefact of the comparison.

That test is run by `pnpm run test:lsp-ratchet` and needs no build, no servers and no corpus.

## Not a defect on the rsvelte side

rsvelte advertises `@` once. Matching official here would mean emitting a duplicate deliberately,
so the ratchet entry stays listed and is attributed to this report rather than closed.

Remove this report when upstream de-duplicates the array.
