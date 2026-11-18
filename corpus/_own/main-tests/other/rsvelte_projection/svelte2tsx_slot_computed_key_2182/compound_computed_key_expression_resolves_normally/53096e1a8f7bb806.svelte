{#each items as item}
    <slot a={{ [item + 1]: 1 }} />
{/each}
