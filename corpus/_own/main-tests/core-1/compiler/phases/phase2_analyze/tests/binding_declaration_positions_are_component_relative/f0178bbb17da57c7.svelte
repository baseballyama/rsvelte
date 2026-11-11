<script context="module">
    const from_module = 1;
</script>
<script>
    import Widget, { named as Alias } from './Widget.svelte';
    import * as Namespace from './namespace';
    let count = 0;
    let { ...rest } = $props();
    function handle_click() {}
    class Controller {}
</script>
<Widget />
