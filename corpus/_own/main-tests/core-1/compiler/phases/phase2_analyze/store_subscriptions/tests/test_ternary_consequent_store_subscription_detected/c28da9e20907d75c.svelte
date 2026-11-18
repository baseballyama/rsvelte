<script>
    import { getContext } from 'svelte';
    const { xGet, yGet } = getContext('X');
    let g = $derived(true ? $xGet : $yGet);
</script>
<p>{g}</p>
