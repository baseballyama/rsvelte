<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

<input bind:$store />