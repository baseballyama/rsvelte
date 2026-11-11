<script>
	import { writable } from 'svelte/store';

	const s = writable(0);
	let total = 0;
	function log(v) {
		total = v;
	}
</script>

<!-- the inner-block `let s` is block scoped; the earlier `s + 1` is the store -->
<button
	onclick={() => {
		const n = s + 1;
		{
			let s = 2;
			log(s);
		}
		log(n);
	}}>a</button
>

<!-- a for-of head DOES bind `s` for its body -->
<button
	onclick={() => {
		for (const s of [1, 2]) {
			log(s + 1);
		}
	}}>b</button
>
