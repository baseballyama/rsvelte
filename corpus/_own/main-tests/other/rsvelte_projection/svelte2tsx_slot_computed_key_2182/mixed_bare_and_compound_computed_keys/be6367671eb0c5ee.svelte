{#each items as item}
    <slot a={{ ['x' + item]: item, [item]: 2 }} />
{/each}
