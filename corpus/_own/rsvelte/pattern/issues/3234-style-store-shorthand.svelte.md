# `3234-style-store-shorthand.svelte`

**Issue:** [#3234](https://github.com/baseballyama/rsvelte/issues/3234)

Shorthand `style:$store`, where the name doubles as the value. Its arm reads `value` and there is no expression to read, which is why it needs the name path the directive rows use
