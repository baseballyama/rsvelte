<script>
 import Outer from './Outer.svelte';
</script>
<Outer><svelte:self slot="a" let:x>{x}</svelte:self></Outer>
