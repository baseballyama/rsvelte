<svelte:options runes />

<script>
	import C from './C.svelte';
</script>

<C>
	<slot let:foo {foo}>{foo}</slot>
	<div slot="a">
		<slot name="b" let:bar={{ baz }} {baz} />
	</div>
</C>
