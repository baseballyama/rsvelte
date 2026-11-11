<script>
	import Foo from './Foo.svelte';
	let style = 'color: red';
	let tag = 'div';
</script>

<div {style}>a</div>
<Foo {style} />
<svelte:element this={tag} {style} />
<slot {style} />
<div style={style}>b</div>
