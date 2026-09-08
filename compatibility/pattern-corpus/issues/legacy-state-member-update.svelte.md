# `legacy-state-member-update.svelte`

**Issue:** [#4036](https://github.com/baseballyama/rsvelte/pull/4036)

Prefix and postfix updates of static and computed members on a legacy reactive object must be enclosed in `$.mutate`. Assignment expressions already took that path, but update expressions bypassed it and changed the object without invalidating dependants.
