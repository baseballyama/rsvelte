<svelte:component this={Foo}>
	{#each a as b}
		<div let:x>{x}</div>
	{/each}
</svelte:component>
