<svelte:options runes />

{#each [1] as $$restProps}{$$restProps}{/each}
{#snippet s($$x)}<i>{$$x}</i>{/snippet}
{@render s(2)}
