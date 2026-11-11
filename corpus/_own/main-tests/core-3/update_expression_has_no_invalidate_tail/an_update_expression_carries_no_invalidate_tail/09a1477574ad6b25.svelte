<script>
	import { writable } from 'svelte/store';
	export const s = writable({ a: 1, t: 'x' });
	let opts = ['x', 'y'];
	function go() { $s.a = 2; }
</script>
<select bind:value={$s.t}>{#each opts as o}<option value={o}>{o}</option>{/each}</select>
<button on:click={() => {}}>go</button>