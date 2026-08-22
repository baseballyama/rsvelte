<script>
	let active = $state(true);
	let size = $state(2);
	let dyn = $state((node) => ({ destroy: () => void node }));

	function tip(node, param) {
		return { update: (p) => void [node, p], destroy: () => {} };
	}
</script>

<div
	class:active
	class:big={size > 1}
	class:a-b-c={active && size > 0}
	style:--custom-prop={`${size}px`}
	style:color={active ? 'red' : 'blue'}
	style:width="{size}em"
	use:tip={{ text: `s=${size}` }}
	use:dyn
>
	{size}
</div>

<button onclick={() => { active = !active; size += 1; }}>+</button>
