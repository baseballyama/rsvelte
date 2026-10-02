<script lang="ts">
    import Component from './ts-event03-input.svelte'; // Component: typeof SvelteComponent
</script>

<Component on:foo="{e=>{ // Component: typeof SvelteComponent, e: CustomEvent<any>
    // e.detail is number
    e.detail; // e.detail: any
}}" />
