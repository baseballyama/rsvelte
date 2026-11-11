<script>
	import C from './01-default-order-basic.svelte';
</script>

<C --z="1" --a="2" />
<C class="c" --a="1" />
<C --a="1" --b="2" class="ok" />
