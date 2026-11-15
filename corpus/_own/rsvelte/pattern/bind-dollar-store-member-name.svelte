<script>
	import { writable } from 'svelte/store';
	const store = writable({ value: '' });
</script>

<input bind:$store.value />
