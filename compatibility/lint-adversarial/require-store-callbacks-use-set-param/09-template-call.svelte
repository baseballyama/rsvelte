<script>
	import { readable } from 'svelte/store';
</script>

<p>{readable(0, (x) => x)}</p>
