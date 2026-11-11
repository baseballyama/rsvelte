<script>
	let { flag } = $props();
</script>

<div class={'plain-literal'}></div>
<div class={flag ? 'ternary-a' : 'ternary-b'}></div>
<div class={['array-a', 'array-b']}></div>
<div class={{ 'object-a': flag }}></div>
<div class={flag && 'logical-a'}></div>

<style>
	.plain-literal {
		color: blue;
	}
	.ternary-a {
		color: blue;
	}
	.array-a {
		color: blue;
	}
	.object-a {
		color: blue;
	}
	.logical-a {
		color: blue;
	}
	.not-in-any-literal-list {
		color: green;
	}
</style>
