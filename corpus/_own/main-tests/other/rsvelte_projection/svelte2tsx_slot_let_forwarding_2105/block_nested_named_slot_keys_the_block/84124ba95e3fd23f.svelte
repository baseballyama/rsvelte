<Foo>
	{#each a as b}
		<svelte:fragment slot="s" let:x>{x}</svelte:fragment>
	{/each}
</Foo>
