<script module>
	/* eslint svelte/derived-has-same-inputs-outputs: "warn" */
	import { derived, writable } from 'svelte/store';

	export const base = writable(0);
</script>

<script>
	// `derived` is imported by the module script and used here
	const r = derived(base, (x) => x);
</script>

<p>{$r}</p>
