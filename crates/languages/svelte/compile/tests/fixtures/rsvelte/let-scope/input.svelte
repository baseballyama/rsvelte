<script>
	import C from "./C.svelte";
	let x = $state(1);
</script>
<C let:x>
	{x}
	<p slot="a">{x}</p>
	<C slot="b" let:y>{x} {y}</C>
</C>
<button onclick={() => x++}></button>
