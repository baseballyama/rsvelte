<script>
    import { slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import action from './action';
    let { ...rest } = $props();
</script>
<div use:action transition:slide {...rest}></div>
{#each [1] as item (item)}
    <div animate:flip>{item}</div>
{/each}
