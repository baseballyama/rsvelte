<script>
	let { onthing, onclick: click, children } = $props();
	let fired = $state(0);
	function relay(e) {
		fired += 1;
		onthing?.(e);
		click?.(e);
	}
</script>

<button onclick={relay} ondblclick={(e) => onthing?.(e)}>
	{@render children?.()}
	{fired}
</button>
