<script>
	/* eslint svelte/derived-has-same-inputs-outputs: "warn" */
	import * as ns from 'svelte/store';

	// one alias chain feeding four store rules at once
	const mk = ns['writ' + 'able'];
	const mkr = ns.readable;

	// no initial value + async callback + wrong callback param name
	const a = mk(undefined, async (start) => {
		start(await Promise.resolve(1));
	});
	const b = mkr();
	const c = ns.derived(a, async (x) => x);

	a.subscribe();
</script>

<!-- raw store operands -->
<p>{a + 1}</p>
{#if b}ok{/if}
<button onclick={() => c.subscribe()}>go</button>
