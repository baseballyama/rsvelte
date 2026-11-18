<script>
    import { writable } from 'svelte/store';
    const items = writable([]);
</script>

<button onclick={() => $items.push('new')}>Add</button>
