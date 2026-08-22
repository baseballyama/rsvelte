<script>
	import Inner from './const-shadowing.svelte';

	let el = $state(null);
	let n = $state(0);
	const spread = { 'data-x': 1, onclick: () => n++ };
</script>

<Inner bind:this={el} {...spread} --theme-color="red" onintro={() => n++} />
<Inner {...spread} bind:this={el} --theme-color={n > 0 ? 'blue' : 'red'} />

<div
	class="one two three four five six seven eight nine ten eleven twelve thirteen"
	style:--gap="{n}px"
	style:color="red"
	style:display|important="grid"
	data-multiline="line one
line two"
>
	{n}{el ? 1 : 0}
</div>
