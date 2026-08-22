<script>
	import * as ns from 'svelte/store';

	const a = ns['writable']();
	const b = ns['writ' + 'able']();
	const c = ns[`readable`]();
	const d = ns['der' + 'ived'](a, ($a) => $a);
</script>

<p>{a}{b}{c}{d}</p>
