<script>
	let active = $state(true);
	let size = $state(3);
	const styles = { color: 'red', '--custom': '1px' };
	const list = ['a', active && 'b', null, undefined, 0, { c: active, d: !active }];
</script>

<div class={list} style={styles}>arrays and objects</div>
<div class={['x', { y: active }]} style:color={active ? 'red' : 'blue'} style:--gap="{size}px">directives</div>
<div class="static {active ? 'on' : 'off'} tail" style="width: {size}px; --z: {size}">interpolated</div>
<div class:active class:big={size > 2} class:a-b-c={active}>class directives</div>
<div class="" style="">empty</div>
<div class={undefined} style={null}>nullish</div>

<style>
	.active {
		font-weight: bold;
	}
	.big {
		font-size: 2em;
	}
	.a-b-c {
		color: var(--custom, green);
	}
	.on,
	.off {
		display: block;
	}
	.x .y {
		gap: var(--gap);
	}
</style>
