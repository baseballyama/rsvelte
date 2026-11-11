<script>
	import { writable } from 'svelte/store';

	export let title;
	const state = writable({ ok: true });
</script>

<h1>{title}</h1>
<p>{$state.ok}</p>
