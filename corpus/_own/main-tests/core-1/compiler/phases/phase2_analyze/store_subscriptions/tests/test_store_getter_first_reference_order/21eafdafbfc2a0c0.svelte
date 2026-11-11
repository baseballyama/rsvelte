<script>
    import { getContext } from 'svelte';
    const { x, y, xGet, yGet } = getContext('X');
    let a = $derived($xGet + $yGet);
</script>
<g>
    {#each [1] as d}
        {@const c = $y}
        <rect data-range={$x}></rect>
    {/each}
</g>
