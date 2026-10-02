<script lang="ts">
    import Component from './ts-event03-input.svelte'; // Component: Component<$$ComponentProps, {}, "">
</script>

<Component onfoo="{e=>{ // Component: Component<$$ComponentProps, {}, "">, e: { detail: number; }
    // e.detail is number
    e.detail; // e.detail: number
}}" />
