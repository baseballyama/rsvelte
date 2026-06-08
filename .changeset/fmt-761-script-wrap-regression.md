---
"@rsvelte/fmt": patch
---

test(fmt): lock `<script>` long type-argument wrapping to oxfmt parity (#761). The `<script>`-body reflow divergence in #761 (e.g. a long `type … = Awaited<ReturnType<…>>;` kept on one line instead of breaking its outer type-argument list) was an `oxc_formatter` digest skew, already aligned across the workspace in #771. This adds a regression test pinning the now-matching output at the pinned rev so a future digest bump that regresses the wrapping is caught. Closes #761.
