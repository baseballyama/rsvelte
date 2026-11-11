<script>
	import C from './01-basic.svelte';
</script>

<C p={{ a: 1 }} />
<div data-x={[1]}>1</div>
<C q="{{ b: 2 }}" />
