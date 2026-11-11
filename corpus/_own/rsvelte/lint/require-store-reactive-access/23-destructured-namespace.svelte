<script>
	import * as ns from 'svelte/store';

	const { writable: mk, readable: mkr = ns.readable } = ns;
	const { ['derived']: mkd } = ns;

	const a = mk(0);
	const b = mkr(0);
	const c = mkd(a, ($a) => $a);
</script>

<p>{a + 1}</p>
<p>{b + 1}</p>
<p>{c + 1}</p>
