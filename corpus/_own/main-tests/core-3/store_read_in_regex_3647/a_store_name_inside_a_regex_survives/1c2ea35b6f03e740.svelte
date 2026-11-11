<script>
	import { readable } from 'svelte/store';
	const s = readable(1);
	let re;
	$: re = /\$s/gi;
</script>
<b>{$s}{re}</b>
