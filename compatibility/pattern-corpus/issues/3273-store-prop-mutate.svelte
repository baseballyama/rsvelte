<script>
	import { writable } from 'svelte/store';

	export let x;
	const y = writable({ k: 0 });
</script>

<button
	onclick={() => {
		$x.k = 1;
		$y.k = 1;
	}}>go</button
>
