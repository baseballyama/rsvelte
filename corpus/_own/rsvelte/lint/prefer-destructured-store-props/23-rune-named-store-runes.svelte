<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<div>
	{$derived.by}
	{$state.raw}
	{doubled}
</div>
