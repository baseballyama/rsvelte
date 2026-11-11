<script>
	import { readable } from 'svelte/store';
	const s = readable(1);
	let re;
	$: re = (1 / 2) + $s;
</script>
<b>{$s}{re}</b>
