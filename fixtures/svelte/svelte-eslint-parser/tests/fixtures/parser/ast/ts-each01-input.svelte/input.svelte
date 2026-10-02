<script lang="ts">
    const list: number[] = []
    const items: {id:number, name:string}[] = []
</script>
{#each list as e}
    {e}
{/each}
{#each items as item, index (item.id)}
    {index}{item.name}
{/each}
