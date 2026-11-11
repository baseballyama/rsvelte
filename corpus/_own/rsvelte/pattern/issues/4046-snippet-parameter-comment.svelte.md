# `4046-snippet-parameter-comment.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

A comment in a snippet header's parameter list. **Known divergence** — rsvelte drops it on every target. Upstream borrows the instance script's `loc` for the whole component block, which revives the dead comment cursor and flushes the comment at the render tag (`/* parameter */\n\tbody($$anchor, () => pending);`); rsvelte anchors per region, and a template node ahead of the render tag has no position in the comment buffer to claim. Tracked by the two `#[ignore]`d tests in `comment_cursor_3603_await_snippet.rs`.
