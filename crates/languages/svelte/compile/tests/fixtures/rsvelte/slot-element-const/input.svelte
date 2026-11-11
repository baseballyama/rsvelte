<script>
	import C from "./C.svelte";
	let k = $state(1);
</script>
<C>
	<p slot="a">
		{@const twice = k * 2}
		{twice}
	</p>
</C>
<button onclick={() => k++}></button>
