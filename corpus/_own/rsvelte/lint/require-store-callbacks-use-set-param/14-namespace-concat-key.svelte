<script>
	import * as ns from 'svelte/store';

	const a = ns['writ' + 'able'](0, (start) => start());
	const b = ns['readable'](0, (start) => start());
	const c = ns[`writ` + `able`](0, () => {});
</script>

<p>{a}{b}{c}</p>
