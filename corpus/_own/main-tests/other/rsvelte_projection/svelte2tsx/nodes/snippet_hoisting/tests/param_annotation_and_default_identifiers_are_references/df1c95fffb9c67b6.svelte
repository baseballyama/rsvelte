<script lang="ts" module>
export const m = 1;
</script>
<script lang="ts">
const c = { raise: () => 1 };
</script>
{#snippet s(r: ReturnType<typeof c.raise>)}{r}{/snippet}