<script>
	import { readable } from 'svelte/store';
	const s = readable(1);
	let re;
	$: re = `${String(/\$s/)}`;
</script>
<b>{$s}{re}</b>
