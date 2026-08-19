<script>
	// A legacy (non-runes) component: `$state` here is a plain store name.
	export let state;
	export let derived;
	let ready = false;
	$: ready = Boolean(state);
</script>

<p>{$state.value}</p>
<p>{$derived.value}</p>
<p>{$effect.value}</p>
<p>{$props.value}</p>
<p>{ready}</p>
