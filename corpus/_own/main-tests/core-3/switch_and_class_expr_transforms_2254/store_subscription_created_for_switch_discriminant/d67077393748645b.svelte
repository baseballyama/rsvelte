<script>
	import { writable } from 'svelte/store';
	const s = writable(1);
	const { sink, other } = $props();
</script>

<button onclick={() => {
switch ($s) { case 1: sink(1); }
}}>x</button>
