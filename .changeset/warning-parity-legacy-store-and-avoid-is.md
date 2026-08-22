---
"@rsvelte/compiler": patch
---

Stop emitting `reactive_declaration_module_script_dependency` for store auto-subscriptions read or written inside a `$:` statement: upstream declares the synthetic `$store` binding in the instance scope, so it never satisfies the rule's module-scope test, while rsvelte parks it in scope 0.

Attach the attribute's span to the `attribute_avoid_is` warning, which was reported with no position at all.
