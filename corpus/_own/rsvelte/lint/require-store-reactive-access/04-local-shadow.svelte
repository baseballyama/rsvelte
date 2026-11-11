<script>
	import { writable } from 'svelte/store';

	const s = writable(0);

	function calc() {
		let s = 1;
		const r = s + 1;
		return r;
	}

	const total = calc();
</script>

<p>{$s} {total}</p>
