# `store-source-read-of-a-reassigned-let.svelte`

**Issue:** corpus residue

A store's own binding is read the way `build_getter` reads any reference to it — a prop is a getter call, a reassigned legacy `let` is a signal read, anything else is the bare name. Six rewriters asked this separately.
