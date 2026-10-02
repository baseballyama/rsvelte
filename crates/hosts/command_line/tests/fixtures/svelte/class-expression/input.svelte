<script>
	let active = $state(false);
	let size = $state('small');
	let tone = $state(null);
	const base = 'card';

	function variant(v) {
		return `btn-${v}`;
	}
</script>

<div class={size}>expression</div>
<div class="box {size} rounded">interpolated</div>
<div class="{size}">quoted</div>
<div class={{ active, large: size === 'large' }}>object</div>
<div class={['item', active && 'is-active', tone]}>array</div>
<div class={base}>constant</div>
<div class={'literal'}>literal</div>
<div class={`t-${size}`}>template</div>
<div class={variant(size)}>call</div>
<button onclick={() => (active = !active)}>toggle</button>
<button onclick={() => (size = size === 'small' ? 'large' : 'small')}>resize</button>
