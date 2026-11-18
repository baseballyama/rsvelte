# `3180-snapshot-position.svelte`

**Issue:** [#3180](https://github.com/baseballyama/rsvelte/issues/3180)

The same positions through a component's two scripts. `<script module>` and the instance script reach the class-field lowerer by different routes, and only the module half also reaches the `compileModule`-style declarator strip
