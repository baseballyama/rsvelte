<script>
	import { writable } from 'svelte/store';
	const a = writable(0);
	const src = { o: { a: 1 } };
	function go() {
		({ o: { a: $a } } = src);
	}
</script>
<button onclick={go}>{$a}</button>