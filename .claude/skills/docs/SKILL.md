---
name: docs
description: Write or edit text that people read - the site's Japanese pages and the repository's English Markdown (README, AGENTS.md, skills). Makes each page as easy to read and as short as it can be, then checks it with textlint and a fresh reader. Use for "write the docs", "make this clearer", "rewrite this page", "/docs".
user_invocable: true
---

# Docs

The goal is a page that a frontend engineer understands on the first read. Cut every word
that does not help the reader, and keep every fact.

## 1. Before writing

- Name the reader and the one question the page answers. Put the answer first.
- Read the code the page describes. Never write a fact, number, name or link you did not check.
  Keep implemented behavior, plans and measured results apart.
- One page answers one question. Move side topics to the page that owns them, and link to it.

## 2. Writing rules

Both languages:

- One sentence, one idea. The subject and its verb stay close together.
- Say what something does before you name it. Define a term at its first use on the page.
- Use the active voice and positive statements. Name the input, the operation and the result.
- Use a numbered list for steps, a table to compare, and a code block for anything to type.
  Show one real example and follow it far enough to see the result.
- Say each thing once. Do not announce what the page covers, and do not repeat it at the end.
- Use well-known acronyms (`acronyms` in `tools/writing/words.ts`) as they are. Spell out any
  other acronym, and do not shorten names in prose.
- Write a code name as code (`SourceLocation`), and explain it once, at its first use. Do not
  replace it with a long description in running text: the reader cannot match it to the code.
- Give one thing one name on the whole site. Pick it, and use it everywhere.
- A commit hash in prose needs a reason to be there. Say what the commit did: 「境界を直した
  変更（コミット `573ac584b6`）」. Leave it out when the sentence does not depend on it.
- Readers open one page at a time. Explain a term from another page in one short phrase, or
  link to it, at its first use on this page.

Japanese (the site):

- Aim for 40 to 60 characters per sentence; textlint stops at 80.
- Put a space between Japanese and half-width text or inline code: 「UTF-8 の文字列」「`parse` を呼ぶ」.
- Write in hiragana what reads easier in hiragana: こと, とき, ください, できる.
- Avoid the stiff connectors that lengthen sentences: 〜において, 〜することで, 〜を行う, 〜となります.
- Use full-width parentheses and colons inside Japanese sentences.

English (Markdown):

- Plain American English, present tense, second person for instructions ("Run ...").
- Prefer the short word: `use`, not `utilize`; `about`, not `approximately`.

## 3. Remove AI writing patterns

Read `.claude/skills/humanizer/SKILL.md` and apply it. Its patterns hold in Japanese too. Look
for these in particular:

- A contrast that only adds weight: 「〜ではなく、〜です」
- Groups of three written by habit, and a closing line that repeats the point.
- Inflated words: 重要, 強力, さまざまな
- A bold label on every item.

## 4. Check

Run the checks for the files you changed, and fix the text until they pass. To silence a
finding about your own prose, rewrite the sentence. Do not add an exception or a baseline.
Add a word to `tools/writing/words.ts` only for a real technical term.

```sh
pnpm --dir apps/site run lint:prose        # the site's Japanese text
pnpm --dir apps/site run lint:code-names
pnpm --filter @rsvelte-experimental/writing run lint [file ...]   # English Markdown
```

A clean lint does not make the text right. Read the page in the browser once, and check every
code example and link.

## 5. Test with a fresh reader

Give a subagent with no context only the finished text (not the code, not your intent), and
ask it:

1. In one sentence each: what does this page tell you, and what can you do after reading it?
2. Which sentence did you have to read twice, and why?
3. Which word did you not know at the point where it appeared?
4. Which sentence could you delete without losing a fact?

Fix every answer that shows a misreading or a gap, then ask a new subagent again. Stop when two
readers in a row find nothing to fix.

## Sources

The rules above come from three public skills, checked in November 2026:

- [humanizer](https://github.com/blader/humanizer) (MIT), copied to `.claude/skills/humanizer`.
- [writing-clearly-and-concisely](https://github.com/obra/the-elements-of-style), which teaches
  the rules of Strunk's _The Elements of Style_ (1918).
- [doc-coauthoring](https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring), whose
  "reader testing" stage is step 5.
