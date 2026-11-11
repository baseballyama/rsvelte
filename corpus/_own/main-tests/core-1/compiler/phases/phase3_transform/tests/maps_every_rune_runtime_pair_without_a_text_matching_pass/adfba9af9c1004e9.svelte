<script>
	let state = $state(0);
	let raw = $state.raw({});
	state = 1;
	raw = {};
	let derived = $derived(state);
	let by = $derived.by(() => state);
	let { value = $bindable(), ...rest } = $props();
	value = 1;
	$effect(() => state);
	$effect.pre(() => state);
</script>
<p>{state}{raw}{derived}{by}{value}{rest}</p>