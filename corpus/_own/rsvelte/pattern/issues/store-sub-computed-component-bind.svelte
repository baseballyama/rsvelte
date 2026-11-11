<script>
	import Child from './Child.svelte';
	import { writable } from 'svelte/store';

	const values = writable({ first: '' });
	const key = writable('first');
</script>

<Child bind:value={$values[$key]} />
