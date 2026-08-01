---
"@rsvelte/compiler": patch
---

Fix the client preamble emitting `$$ownership_validator` before `$.append_styles` when `css: 'injected'` and dev-mode mutation validation are both active. Upstream unshifts `$$ownership_validator` before it unshifts `$.append_styles`, so the later unshift ends up closer to the front — the correct order is `$.push(...)`, `$.append_styles(...)`, then `$$ownership_validator = ...`. `$.append_styles` is now inserted at the same anchor point as `$$ownership_validator`, in the same call order as upstream's unshifts, instead of being built at an unrelated position in the component body.
