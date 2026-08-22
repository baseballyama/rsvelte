<script>
	import { writable } from 'svelte/store';

	const 店 = writable(0);
	/* 🎌 */ 店.subscribe(() => {});
</script>

<p>{$店}</p>
