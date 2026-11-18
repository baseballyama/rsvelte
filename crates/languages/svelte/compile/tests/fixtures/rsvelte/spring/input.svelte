<script>
	import { Spring } from 'svelte/motion';

	const size = new Spring(10);
</script>

<p>{size.current}</p>
