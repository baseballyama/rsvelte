---
name: site-writing
description: Write or review Japanese and English explanations on the rsvelte site, with supported claims, concrete examples, and prose checks. Use for substantial reader-facing pages, not code-only changes.
---

# Site writing

Read `apps/site/AGENTS.md` and the design documents behind the page's claims.
For comparisons, check the other tool's official documentation. Record the check
date and link the exact supporting page near the claim.

Write for frontend engineers. Use standard terms such as parsing, name resolution,
props, binding, static linking, and hydration. Define unfamiliar terms through their
operation. Do not replace a technical term with vague wording such as "read the
file" or "know how the screen uses it". Explain the input, operation, and result. Follow one example far enough to show the consequence. Avoid
repeating the same claim in an introduction, a list, and a closing paragraph.

Keep supported differences. Remove invented objections, empty transitions, and
adjectives used instead of evidence. Do not add personal anecdotes or errors to
make text appear human. Preserve technical facts and uncertainty when editing.

Keep implemented behavior, plans, and measured effects distinct. Cache claims
must say when the cached value expires. Extension claims must say how users load
their code. A comparison must also state the competing tool's relevant capability.

Use diagrams for relationships and controls for decisions with changing inputs.
Label explanatory models. Animation must not imply measured speed. Keep the
explanation available with motion disabled and without interacting with controls.

Read the draft aloud. Remove sentences that add no new information. Check every
code example and every link. Then run the checks in `apps/site/AGENTS.md`.
Fix the prose instead of weakening the rules. Static checks cannot establish
naturalness, authorship, or factual accuracy.

## English pages

Write English from the code and the load data, not only from the Japanese page. Keep the same facts,
numbers, anchors, figures and links (with `/en`). Follow the
[Google developer documentation style highlights](https://developers.google.com/style/highlights) and the
[Microsoft top 10 tips for style and voice](https://learn.microsoft.com/en-us/style-guide/top-10-tips-style-voice):
short active sentences, "you" for the reader, the main point first, conditions before instructions, sentence case
headings, descriptive link text, plain words for a global audience, and no idioms, hype or pre-announcing.
Write a chapter reference as `Chapter <a href="/en/learn/...">04</a>`.

See [the research and adoption notes](references/writing-tools.md) when changing
the editing method or the prose checks.
