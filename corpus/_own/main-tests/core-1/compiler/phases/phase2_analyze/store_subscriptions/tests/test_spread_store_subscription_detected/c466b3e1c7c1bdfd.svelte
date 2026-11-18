<script>
    import { getContext } from 'svelte';
    const { xRange } = getContext('X');
    let left = $derived(Math.max(...$xRange));
</script>
<p>{left}</p>
