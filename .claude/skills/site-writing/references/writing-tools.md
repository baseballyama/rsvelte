# Writing tools evaluated

Reviewed on 2026-10-02. The local skill is an original adaptation for Japanese
technical explanations. No upstream skill scripts or detectors are installed.

| Source | Useful guidance | Local choice |
| --- | --- | --- |
| [blader/humanizer](https://github.com/blader/humanizer/blob/main/SKILL.md) | Review structure, repeated conclusions, empty contrasts, and unsupported claims. | Adopt an editorial pass. Preserve facts and uncertainty. |
| [keez97/humanizer](https://github.com/keez97/humanizer/blob/main/SKILL.md) | Review paragraph rhythm as well as vocabulary; consider false positives. | Use manual review. Do not use an English-oriented score as a Japanese quality gate. |
| [Aboudjem/humanizer-skill](https://github.com/Aboudjem/humanizer-skill/blob/main/skills/humanizer/SKILL.md) | Separate editing from mechanical pattern detection and account for voice. | Keep the site's Japanese technical register; skip persona and detector scoring. |
| [Japanese technical writing](https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing) | Check sentence length, grammar, and redundant wording. | Keep the existing pinned preset. |
| [AI writing patterns](https://github.com/textlint-ja/textlint-rule-preset-ai-writing) | Check hype and mechanical emphasis and lists. | Keep the existing pinned preset; preserve Svelte emphasis, headings, and list structure in extracted text so these checks can run. |
| [prh](https://github.com/textlint-rule/textlint-rule-prh) | Maintain terminology and specific phrase replacements. | Add a small set of empty reader-addressing transitions to the existing dictionary. |

`scripts/prose.test.mjs` in the site checks that deliberately bad rendered prose
fails and normal emphasis and lists pass. It also checks dynamic text extraction.
The extractor checks passages separately, so rules needing adjacency between
separate blocks, including colon-to-next-block checks, still need manual review.
Do not report a clean lint result as proof that text is human-written.
