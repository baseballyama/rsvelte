<script>
	import { writable } from 'svelte/store';

	const s = writable(0);
	function go() {}
	function log(v) {
		return v;
	}
</script>

<!-- the catch param binds `s` inside the catch block only -->
<button
	onclick={() => {
		try {
			go();
		} catch (s) {
			log(s + 1);
		}
	}}>a</button
>

<!-- after the try/catch, `s` is the store again -->
<button
	onclick={() => {
		try {
			go();
		} catch (e) {
			log(e);
		}
		log(s + 1);
	}}>b</button
>
