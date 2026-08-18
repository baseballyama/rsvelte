<script>
	import C from './01-basic.svelte';
	let dyn = 'a';
</script>

<div data-name={dyn}>1</div>
<C name={dyn} />
<C>
	<div slot={dyn}>2</div>
</C>
