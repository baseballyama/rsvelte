<script>
	import { readable } from 'svelte/store';
	const re = /\$other/;
	const s = readable(1);
</script>
<b>{$s}</b>
