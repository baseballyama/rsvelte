# `legacy-rest-props-script-read.svelte`

**Issue:** [#4037](https://github.com/baseballyama/rsvelte/pull/4037)

Legacy instance-script reads must keep `$$props` and `$$restProps` distinct: only the former becomes `$$sanitized_props`. Both were synthetic `rest_prop` bindings for dependency tracking, and collecting transforms by binding kind rewrote `$$restProps.extra` through `$$props.extra`, silently including declared props and breaking `delete`.
