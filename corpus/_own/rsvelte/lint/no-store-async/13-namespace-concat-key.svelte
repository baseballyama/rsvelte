<script>
	import * as ns from 'svelte/store';

	const a = ns['writ' + 'able'](0, async () => {});
	const b = ns['readable'](0, async () => {});
	const c = ns[`der` + `ived`](a, async () => {});
</script>

<p>{a}{b}{c}</p>
