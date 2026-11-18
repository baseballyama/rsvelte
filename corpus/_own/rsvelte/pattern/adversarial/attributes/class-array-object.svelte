<script>
	let active = $state(true);
	let size = $state('lg');
</script>

<div class={['base', active && 'on', { dim: !active, [`size-${size}`]: true }]}>a</div>
<div class={{ solo: active }}>b</div>
<div class={active ? 'yes' : ['no', { never: false }]}>c</div>
<div class="static extra" class:active class:big={size === 'lg'}>d</div>

<style>
	.base {
		color: red;
	}
	.on {
		color: green;
	}
	.dim {
		opacity: 0.5;
	}
	.solo {
		color: blue;
	}
	.active {
		font-weight: bold;
	}
	.big {
		font-size: 2em;
	}
</style>
