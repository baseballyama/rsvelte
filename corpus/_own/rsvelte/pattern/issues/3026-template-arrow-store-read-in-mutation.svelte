<script>
	import { writable } from 'svelte/store';

	const { state } = $props();
	const s = writable({ x: 1 });
</script>

<button
	onclick={() => {
		state.a = $s.x;
	}}>go</button
>
