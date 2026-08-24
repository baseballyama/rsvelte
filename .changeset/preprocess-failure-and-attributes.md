---
"@rsvelte/compiler": patch
---

Stop a failing preprocessor from killing the Node process, and discard an attribute-only result the way upstream does. A JS callback that threw was routed through `napi_fatal_exception`, so `await preprocess(...)` never rejected and the caller's `try`/`catch` never ran — in a Vite dev server one SCSS syntax error took the server down instead of drawing an error overlay. The callback is now called through `call_async_catch`, and the rejection carries the user's own message rather than `GenericFailure, oneshot canceled`. Separately, a `script` / `style` result whose code is unchanged and which returns no map is discarded whole, `attributes` included: applying them re-emitted the tag with a replaced attribute list, so `<script module>` lost its `module` and compiled as an instance script.
