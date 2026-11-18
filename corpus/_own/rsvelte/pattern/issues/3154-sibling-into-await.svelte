<script>
	const p = Promise.resolve(1);
</script>

<style>
	.b + .x {
		color: red;
	}
	.b ~ .x {
		color: green;
	}
	.c + .y {
		color: blue;
	}
	.c ~ .z {
		color: teal;
	}
</style>

<div class="b">
	{#await p then v}
		<div class="x">t</div>
	{/await}
</div>
<div class="c"></div>
{#await p then v}
	<div class="y">t</div>
{/await}
{#await p then v}
	<div class="z">t</div>
{/await}
