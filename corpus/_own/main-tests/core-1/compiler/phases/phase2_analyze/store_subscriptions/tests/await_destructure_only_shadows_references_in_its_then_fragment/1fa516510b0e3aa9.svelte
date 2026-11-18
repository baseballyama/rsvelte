<script>
    import { readable } from 'svelte/store';
    const gltf = readable(null);
    const assets = Promise.resolve([]);
</script>

<p>{$gltf}</p>
{#await assets then [$gltf]}
    <p>{$gltf}</p>
{/await}
