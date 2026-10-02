<script lang="ts">
    import Component from './ts-event03-input.svelte';
</script>

<Component onfoo="{e=>{
    // e.detail is number
    e.detail;
}}" />
