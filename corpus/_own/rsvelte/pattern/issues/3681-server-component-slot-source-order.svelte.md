# `3681-server-component-slot-source-order.svelte`

**Issue:** [#3681](https://github.com/baseballyama/rsvelte/issues/3681)

Server component slot bodies are built in first-source occurrence order, so generated-name allocation agrees when named content precedes the default slot.
