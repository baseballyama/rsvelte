<script>
	let { items, rest } = $props();
	let count = $state(0);
</script>

<ul>
	<slot />
</ul>
<slot name="header" title="Hi" {count} total={items.length} first={items.at(0)} {...rest}>
	<p>No header {count}</p>
</slot>
<div><slot name="footer" label="a {count} b" /></div>
<button onclick={() => count++}>+</button>
