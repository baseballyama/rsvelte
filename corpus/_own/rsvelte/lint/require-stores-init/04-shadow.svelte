<script>
	import { writable } from 'svelte/store';

	function make(writable) {
		return writable();
	}

	const real = writable(0);
	const fake = make(() => 1);
</script>

<p>{$real} {fake}</p>
