<style>
	.a.b {
		color: red;
	}
	.b .a {
		color: purple;
	}
	.p .q {
		color: green;
	}
	.b .q {
		color: navy;
	}
	.r {
		.s {
			color: blue;
		}
	}
	.b {
		.a {
			color: maroon;
		}
	}
</style>

<div class="b">
	<svelte:element this={'div'} class="a">t</svelte:element>
	<div class="q">t</div>
</div>
<div class="s">t</div>
