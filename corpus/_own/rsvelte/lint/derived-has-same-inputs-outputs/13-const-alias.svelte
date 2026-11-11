<script>
	/* eslint svelte/derived-has-same-inputs-outputs: "warn" */
	import { derived, writable } from 'svelte/store';

	const a = writable(0);
	const d = derived;
	const e = d;

	const r1 = d(a, (x) => x);
	const r2 = e(a, (y) => y);
	const r3 = derived(a, (z) => z);
</script>

<p>{$r1}{$r2}{$r3}</p>
