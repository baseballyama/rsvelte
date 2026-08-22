<script>
	import { writable } from 'svelte/store';

	const s = writable(0);

	function identity(v) {
		return v;
	}
	const viaFn = identity(s);

	const bag = { s };
	const { s: fromObject } = bag;

	const alias = s;
</script>

<p>{alias + 1}</p>
<p>{viaFn + 1}</p>
<p>{fromObject + 1}</p>
<p>{bag.s + 1}</p>
