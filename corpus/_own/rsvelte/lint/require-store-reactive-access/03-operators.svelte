<script>
	import { writable } from 'svelte/store';

	let s = writable(1);
</script>

<p>{s + 1}</p>
<p>{`v=${s}`}</p>
<p>{-s}</p>
<p>{s === 1}</p>
<p>{s()}</p>
<p>{[...s]}</p>
<p>{typeof s}</p>
