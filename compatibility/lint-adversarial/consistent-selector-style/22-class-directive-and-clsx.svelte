<script>
	let cond = true;
</script>

<div class:whitelisted={cond}>a</div>
<div class={['clsx-a', cond && 'clsx-b']}>b</div>
<div class={{ 'obj-a': cond }}>c</div>

<style>
	.whitelisted {
		color: red;
	}
	.clsx-a {
		color: red;
	}
	.obj-a {
		color: red;
	}
</style>
