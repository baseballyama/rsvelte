<script>
	let { data } = $props();
	let doubled = $derived(data * 2);
	let byRune = $derived.by(() => data * 3);
	let counted = $state(0);
	void [doubled, byRune, counted];
</script>
<p>state is not exempt upstream</p>
