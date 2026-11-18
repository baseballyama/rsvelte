<script>
	import { writable } from 'svelte/store';

	export const shape = writable({ a: 1, t: 'x' });
	let opts = ['x', 'y'];

	function bump() {
		$shape.a = 2;
		$shape.a += 3;
		$shape.a++;
	}
</script>

<button onclick={bump}>bump</button>

<select bind:value={$shape.t}>
	{#each opts as o}
		<option value={o}>{o}</option>
	{/each}
</select>
