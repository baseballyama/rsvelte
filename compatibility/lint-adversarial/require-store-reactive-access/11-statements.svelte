<script>
	import { writable } from 'svelte/store';

	const s = writable([1]);
	let n = 0;
	for (const v of s) n += v;
	switch (s) {
		default:
			n += 1;
	}
	n += s;
	const spread = [...s];
</script>

<p>{n} {spread}</p>
