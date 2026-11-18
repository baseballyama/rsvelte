{#if flag}<span>aaaaaaaa bbbbbbbb cccccccc dddddddd eeeeeeee ffffffff gggggggg</span>{/if}
{#each items as item}<span>{item.aaaaaaaa}{item.bbbbbbbb}{item.cccccccc}{item.dddddddd}{item.eeeeeeee}</span>{/each}
{#key flag}<span>aaaaaaaa bbbbbbbb cccccccc dddddddd eeeeeeee ffffffff gggggggg</span>{/key}
{#await promise}<span>aaaaaaaa bbbbbbbb cccccccc dddddddd eeeeeeee ffffffff gggggggg</span>{/await}
