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
	{#snippet inner()}
		<div class="x">t</div>
	{/snippet}
	{@render inner()}
</div>
<div class="c"></div>
{#snippet after()}
	<div class="y">t</div>
{/snippet}
{@render after()}
{#snippet later()}
	<div class="z">t</div>
{/snippet}
{@render later()}
