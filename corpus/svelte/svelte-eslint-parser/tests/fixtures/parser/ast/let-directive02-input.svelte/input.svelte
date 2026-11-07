<script>
	import Hoverable from './Hoverable.svelte';
</script>

<Hoverable let:hovering={ {foo:active} }>
	<div class:active />
</Hoverable>
