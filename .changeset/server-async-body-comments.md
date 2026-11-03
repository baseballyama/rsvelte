---
'@rsvelte/compiler': patch
---

Keep instance-script comments under `experimental.async` when the component has a top-level `await`. On the server the async body split printed and re-parsed the instance body without its comments, so every comment in it was dropped, including those inside function bodies. On both targets the split also dropped an own-line comment that preceded a declaration or other keyword statement.
