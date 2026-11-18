<script>
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	let show = true;
	void flip;
</script>

{#if show}
	<div transition:fade>default allows transitions</div>
	<div in:fly={{ y: 1 }} out:fade>in/out</div>
	<div animate:flip>animation</div>
	<div transition:fade style="color: red">but the style attribute still reports</div>
{/if}
