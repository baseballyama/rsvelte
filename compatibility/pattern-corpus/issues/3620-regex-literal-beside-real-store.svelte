<script>
	import { readable } from 'svelte/store';

	const mystore = readable(1);
	const re = /\$other/;
</script>

<b>{$mystore}{re.source}</b>
