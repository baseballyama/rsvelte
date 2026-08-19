<script>
	import C from './01-bind-class-basic.svelte';
	let click = () => {};
	let action = () => {};
	let fade = () => ({});
	let flip = () => ({});
	let item = 1;
</script>

<div on:click={click}>event</div>
<div use:action={action}>action</div>
<div transition:fade={fade}>transition</div>
<div animate:flip={flip}>animation</div>
<C let:item={item}>let</C>
