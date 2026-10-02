<script lang="ts">
    import Component from './ts-event03-input.svelte';
</script>

<Component on:foo="{e=>{
    // e.detail is number
    e.detail;
}}" />
