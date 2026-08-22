<script>
	import * as ns from 'svelte/store';

	const { writable: mk } = ns;
	const { ['readable']: mkr } = ns;

	const a = mk(0, async (set) => {
		set(await Promise.resolve(1));
	});
	const b = mkr(0, async function (set) {
		set(await Promise.resolve(2));
	});
</script>

<p>{a}{b}</p>
