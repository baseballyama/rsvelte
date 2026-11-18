<script>
	import { readable } from 'svelte/store';
	const s = readable(1);
	let re;
	$: re = (() => { return /\$s/; })();
</script>
<b>{$s}{re}</b>
