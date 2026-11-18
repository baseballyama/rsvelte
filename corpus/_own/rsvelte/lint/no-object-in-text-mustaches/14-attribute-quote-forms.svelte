<script>
	import C from './01-basic.svelte';
	let a = 1;
</script>

<C prop={{ a }} />
<C prop="{{ a }}" />
<C prop="x{{ a }}" />
<C prop="{{ a }}{a}" />
<div data-x={{ a }}></div>
