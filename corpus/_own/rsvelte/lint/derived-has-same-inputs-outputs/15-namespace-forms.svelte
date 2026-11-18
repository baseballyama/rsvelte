<script>
	/* eslint svelte/derived-has-same-inputs-outputs: "warn" */
	import * as ns from 'svelte/store';

	const a = ns.writable(0);

	const r1 = ns.derived(a, (x) => x);
	const r2 = ns['derived'](a, (y) => y);
	const r3 = ns[`derived`](a, (z) => z);
	const r4 = ns['der' + 'ived'](a, (w) => w);
</script>

<p>{$r1}{$r2}{$r3}{$r4}</p>
