# Chunk review prompt

The `review` skill sends this prompt to a reviewer (a subagent or Codex) for one
chunk. Fill in `<BASE>`, `<CHUNK NAME>`, the file list and `<FOCUS>` before you send it. The
reviewer only reads. It must not edit files or run tests.

```
Review only the files in this chunk. Do not report anything about other files.
Do not edit any file. Only report.

Base branch: <BASE>
Chunk: <CHUNK NAME>
Files (review only these):
- <file1>
- <file2>

Steps:
1. Run `git diff <BASE>...HEAD -- <files>` to see the change.
2. Read the whole files and the code around them (callers, types, tests) when you need context.
3. Read AGENTS.md and docs/concept.md (principles P1-P7 and non-goals). Judge the change by them.

Focus: <FOCUS>

Always check:
1. Correctness: missed branches, edge cases (empty input, Unicode, CRLF, very large files),
   off-by-one errors in spans and byte offsets.
2. Oracle fidelity: output must match the official tool as measured by the fixtures. A change
   that alters output needs fixture evidence. Guesses about upstream behavior are not evidence.
3. Concept principles:
   - P1: no scanning of raw source bytes to find structure outside the lexer/parser.
   - P2: one meaning, one implementation. client/server/dev differ by a parameter, not a copy.
   - P3: shared trees are immutable. No re-parsing of generated text.
   - P4: one Span type. A synthetic position has its own type. One integer never has two meanings.
   - P5: no serde_json::Value inside the pipeline.
   - P6: semantic data lives in side tables; our trees stay Sync.
   - P7: claims about speed or correctness need a measurement.
4. Performance: needless allocation or clone in hot paths, O(n^2) loops, work per node that could
   be done once per file.
5. Error handling: no silent failure. A fallback like `unwrap_or_default` on a computed value can
   hide a bug; flag it.
6. Duplication: the same logic in two places (a P2 risk).
7. Tests: the change is covered by a fixture or a unit test, and the test fails without the change.
8. Comments and docs: comments state only a short WHY. LayoutInstructions are short and in plain English.

Output:
- Group findings by file.
- Each finding: `file:line`, severity (Critical / Major / Minor), the problem, and a fix (with code
  when useful).
- If there is nothing to report, write exactly "No findings".
```

## Severity

| Severity | Meaning | Action |
|---|---|---|
| Critical | Wrong output, crash, data loss, security problem | Must fix. Do not approve. |
| Major | Breaks a concept principle, missing test, clear performance problem, design problem | Fix unless there is a good reason. |
| Minor | Naming, readability, small cleanups | Optional. |

## Loop rules (for every reviewer)

- Review one chunk at a time, in order.
- After each result, show the findings to the user with the chunk name, reviewer name and round
  number. Propose fixes for Critical and Major. Fix only what the user approves.
- If you changed code, run the same reviewer on the same chunk again.
- A chunk is done when no Critical or Major finding is left, or the user skips the rest.
- After 5 rounds on one chunk, ask the user if they want to skip the rest and move on.
- Show progress each round, for example: `Chunk 2/4 (rust: crates/parser/) / reviewer 1/4 / round 2`.
- A reviewer that failed to run (error, timeout) has not reviewed. Never count it as "No findings".
