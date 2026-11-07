{#each list as item, index (item)}
	<li animate:flip="{{ delay: 500 }}">{item}</li>
{/each}
