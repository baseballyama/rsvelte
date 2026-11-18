<script>
	import { writable } from 'svelte/store';

	const act = writable(0);
	const s = writable('red');
	const color = writable('blue');
</script>

<div use:act>a</div>
<div transition:act>b</div>
<input bind:value={s} />
<button on:click={s}>c</button>
<div class:on={s}>d</div>
<div style:color>e</div>
