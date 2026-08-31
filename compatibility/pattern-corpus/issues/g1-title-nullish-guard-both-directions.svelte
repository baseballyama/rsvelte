<script>
	export let data;
	// A const whose initializer can be nullish: the title chunk is built as
	// `$.untrack(() => …)`, which upstream evaluates as unknown.
	const region = data.props?.region || null;
	// Statically defined bindings: no `?? ''` on either side.
	function label() {}
	const arrow = () => 1;
	const fixed = 'plain';
	let counter = 0;
	$: doubled = counter * 2;
</script>

<svelte:head>
	<title>{region ? `Cities in ${region.name}` : 'Cities'}</title>
</svelte:head>

<p>{label}{arrow}{fixed}{region}{doubled}</p>
<button on:click={() => counter++}>go</button>
