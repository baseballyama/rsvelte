<script>
	let { keep, ...rest } = $props();
	let state = $state({ Sub: null, deep: { Sub: null } });
	const plain = { Sub: null };
</script>

<rest.component {...rest.props} />
<rest.a.b />

<rest.keep />

<svelte:component this={rest.component} />
<div {...rest.props}></div>
{rest.name}
<div id={rest.id}></div>

<state.Sub />
<state.deep.Sub />
<plain.Sub />

{#each [1] as item}
	<rest.Sub {item} />
{/each}

{keep}
