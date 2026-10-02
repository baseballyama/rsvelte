<script>
	let { items = $bindable([]), config = $bindable({ open: false }) } = $props();
</script>

<button type="button" onclick={() => items.push(items.length)}>{items.length}</button>
<p>{config.open}</p>
