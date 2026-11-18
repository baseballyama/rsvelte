<script lang="ts">
    const value = true;
</script>

{#each items as item}
    {@const getter = () => item}
    <button on:click={function () { value; }}>x</button>
{/each}

<Component>
    {#snippet children({ data })}
        <Child {data} />
    {/snippet}
</Component>
