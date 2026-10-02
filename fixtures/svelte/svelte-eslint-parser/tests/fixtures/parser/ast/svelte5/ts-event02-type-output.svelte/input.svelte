<script lang="typescript">
    import Component from 'foo.svelte' // Component: LegacyComponentType
</script>
<button onclick="{e=>{}}"></button> <!-- e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; } -->
<Component onclick="{e=>{}}"></Component> <!-- Component: LegacyComponentType, e: any -->
