# `removed-effect-keeps-its-semicolon-in-a-switch-case.svelte`

**Issue:** corpus residue

Upstream's server `ExpressionStatement` visitor returns `b.empty` for a statement-position `$effect`, and esrap drops an `EmptyStatement` **only** from a `body` sequence (`Program`, `BlockStatement`, `ClassBody`, `StaticBlock`, `TSModuleBlock`) — a switch case consequent is visited directly and keeps the `;`. rsvelte deleted the statement in every slot. This file is the component port (`server/ast/script.rs`'s `visit_statements`); the sibling `.svelte.js` is the `compileModule` text rewrite, which is a second implementation of the same rule. The corpus output gate cannot see either: oxfmt drops a lone empty statement from both sides, so it surfaced only as a mutation-ratchet entry.
