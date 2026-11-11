<script>
	import * as ns from 'svelte/store';

	const { writable: mk, readable: mkr } = ns;
	const { ['derived']: mkd = ns.derived } = ns;

	const a = mk();
	const b = mkr();
	const c = mkd(a, ($a) => $a);
</script>

<p>{a}{b}{c}</p>
