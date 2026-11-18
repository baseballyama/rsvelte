# `handler-comment-only-body.svelte`

**Issue:** mutation-fuzz seed + 1 corpus file

A template-expression function body whose only content is a comment was dropped from the client output entirely. esrap brackets a body's leading and trailing comments by the body's own `loc`, and rsvelte derives that location from the comment-buffer range the body's lowering consumed — which is empty exactly when the body holds no statement, so the printer's `has_loc` guard skipped the end-of-body flush. A **function-expression** handler is the shape that lands green on all four targets: an arrow is rewritten to a named function in dev, and the element-identifier anchor that rewrite needs still claims the comment there, so the dev half of this defect is open. Reached unmutated by layerchart's `Canvas.svelte`, which is also why 2 of 38 mutation-fuzz seeds diverge with no comment inserted.
