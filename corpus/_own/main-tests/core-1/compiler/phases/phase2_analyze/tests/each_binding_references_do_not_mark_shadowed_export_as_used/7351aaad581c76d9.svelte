<script>
export let value = "outer";
</script>
{#each ["inner"] as value (value)}{String(value)}{/each}