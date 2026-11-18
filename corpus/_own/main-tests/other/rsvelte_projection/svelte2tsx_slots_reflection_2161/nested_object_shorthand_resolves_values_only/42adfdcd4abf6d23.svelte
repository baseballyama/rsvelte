{#each items as item}
    <slot a={{ x: { item }, y: [item], z: item.item }} />
{/each}
