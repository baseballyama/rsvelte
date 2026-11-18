<script>
	import { writable } from 'svelte/store';
	const s = writable(1);

	const obj = {
		label: 'read $s here',
		v: $s
	};
</script>

<div>{obj.v}</div>
