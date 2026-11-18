<script>
	import { writable } from 'svelte/store';
	let searchValue = writable('');
	searchValue = writable('x');
</script>

<input bind:value={$searchValue} />
