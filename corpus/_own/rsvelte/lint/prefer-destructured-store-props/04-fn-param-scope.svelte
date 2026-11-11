<script>
	import { writable } from 'svelte/store';

	const foo = writable({});
</script>

<button on:click={(e) => console.log($foo[e.type])}>a</button>
<input
	on:input={function (ev) {
		console.log($foo[ev.data]);
	}} />
