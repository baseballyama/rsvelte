# `module-derived-destructure-block-body.svelte.js`

**Issue:** corpus residue

`post_process_for_server` decides `$.get(x)` → `x()` from names it scans out of the emitted declarators, and it found a comma-continued declarator by walking back to the nearest `;`. A block-bodied callback puts a `;` inside the previous declarator, so the second name was dropped and every later read came out bare — output that parses, runs and is silently wrong. A concise-body callback is the control, and so is the client target.
