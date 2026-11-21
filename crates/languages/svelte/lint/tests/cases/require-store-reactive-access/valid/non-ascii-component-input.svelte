<script>
	import { writable } from 'svelte/store';
	import Ärger from './Ärger.svelte';
	let store = writable('hello');
</script>

<Ärger prop={store} />
