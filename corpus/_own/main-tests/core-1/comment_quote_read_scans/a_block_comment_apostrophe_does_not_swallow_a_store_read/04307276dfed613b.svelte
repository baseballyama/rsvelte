<script>
	import { writable } from 'svelte/store';
	const s = writable(1);

	const obj = {
		/* it's fine */
		v: $s
	};
</script>

<div>{obj.v}</div>
