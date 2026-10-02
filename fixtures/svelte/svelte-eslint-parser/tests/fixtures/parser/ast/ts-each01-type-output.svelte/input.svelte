<script lang="ts">
    const list: number[] = [] // list: number[]
    const items: {id:number, name:string}[] = [] // items: { id: number; name: string; }[]
</script>
{#each list as e} <!-- list: number[], e: number -->
    {e} <!-- e: number -->
{/each}
{#each items as item, index (item.id)} <!-- items: { id: number; name: string; }[], item: { id: number; name: string; }, index: number, item.id: number -->
    {index}{item.name} <!-- index: number, item.name: string -->
{/each}
