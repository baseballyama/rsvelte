<script>
	import { writable } from 'svelte/store';
	const store = writable({});
	export let f = () => ($store = 1);
</script>
{f}
