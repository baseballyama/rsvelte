<script>
	import Child from './Child.svelte';

	let rest = $state({ a: 1, b: 2 });
	let value = $state('v');
	let node = $state(null);
	const props = $derived({ ...rest, extra: true });
</script>

<Child {...rest} bind:value {...props} bind:this={node} class="after-spread" />
<Child class="before-spread" {...props} bind:value />
<Child {...{ inline: 1, 'quoted-key': 2 }} />
<Child {...(rest.a > 1 ? rest : props)} />

<p>{value}{node ? '1' : '0'}</p>
