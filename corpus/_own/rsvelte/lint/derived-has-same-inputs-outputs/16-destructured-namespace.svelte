<script>
	/* eslint svelte/derived-has-same-inputs-outputs: "warn" */
	import * as ns from 'svelte/store';

	const { derived: mk, writable: mkw } = ns;
	const a = mkw(0);

	const r1 = mk(a, (x) => x);
	const r2 = mk([a, a], ([p, q]) => p + q);
</script>

<p>{$r1}{$r2}</p>
