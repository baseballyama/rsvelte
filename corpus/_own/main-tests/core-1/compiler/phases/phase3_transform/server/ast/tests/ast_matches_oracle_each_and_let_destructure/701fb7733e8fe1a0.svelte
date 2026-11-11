<script>
	import Nested from "./Nested.svelte";
	let c = 0, d = 0, e = 0;
</script>

<div>
	<Nested props={['hello', 'world']}>
		<svelte:fragment slot="main" let:value={pair} let:data={foo}>
			{pair[0]} {pair[1]} {c} {foo}
		</svelte:fragment>
	</Nested>
</div>
<div>
	<Nested props={['hello', 'world']}>
		<svelte:fragment slot="main" let:value={[a, b]} let:data={foo}>
			{a} {b} {d} {foo}
		</svelte:fragment>
	</Nested>
</div>