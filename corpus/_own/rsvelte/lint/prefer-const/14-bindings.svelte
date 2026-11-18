<script>
	import Card from './Card.svelte';
	let cmp;
	let group = $state('a');
	let width = $state(0);
	let dims = $state();
</script>
<Card bind:this={cmp} />
<input type="radio" bind:group value="a" />
<div bind:clientWidth={width}>w</div>
<img src="x.png" alt="x" bind:naturalWidth={dims} />
<p>{width}{dims}{group}</p>
