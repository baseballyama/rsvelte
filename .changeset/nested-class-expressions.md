---
"@rsvelte/compiler": patch
---

Lower a class expression that sits inside a rune argument or an `extends` clause. Upstream reaches every `ClassBody` through the ordinary walk; rsvelte's class-field transform is a text scan that saw neither, so `held = $state(class { deep = $state(1); })` kept `deep` as a plain public field (and in a component's instance script left a live reference to `$state` in the output), and `class Sub extends class { … } { … }` took the inline superclass's brace for its own — lowering the heritage body and leaving the subclass's rune fields alone, on the server as well as the client. `$state(<class expression>)` now also gets the `$.proxy` wrapper upstream's `should_proxy` gives it, and esrap stops parenthesising a `class` / `function` / object-literal superclass, which needs no parentheses.
