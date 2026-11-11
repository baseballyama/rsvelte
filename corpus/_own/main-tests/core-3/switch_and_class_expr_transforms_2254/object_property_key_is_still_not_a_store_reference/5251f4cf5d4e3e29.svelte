<script>
	import { writable } from 'svelte/store';
	const s = writable(1);
	const { sink, other } = $props();
</script>

<button onclick={() => {
sink({ $s: 1 });
}}>x</button>
