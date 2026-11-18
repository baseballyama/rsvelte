<script>
	import { readable } from 'svelte/store';
	const s = readable(1);
	let re;
	$: re = $s + 1;
</script>
<b>{$s}{re}</b>
