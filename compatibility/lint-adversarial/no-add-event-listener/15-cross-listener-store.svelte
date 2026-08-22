<script>
	import { writable } from 'svelte/store';

	const s = writable(0);
	let el;

	function wire() {
		el.addEventListener('a', () => {
			s.subscribe();
		});
		el['addEvent' + 'Listener']('b', () => {});
		el[`addEventListener`]('c', () => {});
	}
</script>

<div bind:this={el}></div>
<button onclick={wire}>{s + 1}</button>
