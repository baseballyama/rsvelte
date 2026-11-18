<script>
import Outer from "./O.svelte";
import Inner from "./I.svelte";
</script>
<Outer>
  {#snippet child(props)}
    {@render Inner(props)}
  {/snippet}
</Outer>