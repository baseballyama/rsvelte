<script module>
	import { writable } from 'svelte/store';

	export const shared = writable(0);
</script>

<script>
	let n = shared + 1;
</script>

<p>{shared + n}</p>
<p>{shared ? 'a' : 'b'}</p>
