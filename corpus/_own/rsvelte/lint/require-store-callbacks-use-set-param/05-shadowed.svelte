<script>
	import { writable } from 'svelte/store';

	function build(writable) {
		return writable(0, (x) => x);
	}

	const real = writable(0, (y) => y);
	const fake = build((v, fn) => fn);
</script>

<p>{$real} {fake}</p>
