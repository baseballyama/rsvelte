<Foo>
	{#each a as b}
		{#key k}
			<svelte:element this={tag} let:x>{x}</svelte:element>
		{/key}
	{/each}
</Foo>
