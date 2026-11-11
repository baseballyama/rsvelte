<script>
	import { writable, get as readStore } from 'svelte/store';
	const count = writable(0);
	let doubled = $derived($count * 2);
	function bump() {
		count.update((c) => c + 1);
		$count += 1;
	}
</script>

<button onclick={bump}>{$count} {doubled} {readStore(count)}</button>
