<script>
	import C from './01-default-order-basic.svelte';
</script>

<C let:b={y} let:a={x}>{x}{y}</C>
<C>
	<div slot="s" name="n">c</div>
</C>
