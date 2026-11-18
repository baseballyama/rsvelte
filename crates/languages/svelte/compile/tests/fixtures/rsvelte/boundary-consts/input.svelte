<script>
	import Flaky from './Flaky.svelte';
	let test = $state(1);
	let o = $state({ a: 1, b: [2] });
</script>
<button onclick={() => test++}></button>
<svelte:boundary>
	{@const double = test * 2}
	{@const { a, b: [c] } = o}
	{#snippet failed()}
		<p>{double}{a}{c}</p>
	{/snippet}
	{#snippet other()}
		<i>{double}</i>
	{/snippet}
	<Flaky />
	<b>{double}{a}</b>
	{@render other()}
</svelte:boundary>
<svelte:boundary>
	{@const x = test + 1}
	<p>{x}</p>
</svelte:boundary>
