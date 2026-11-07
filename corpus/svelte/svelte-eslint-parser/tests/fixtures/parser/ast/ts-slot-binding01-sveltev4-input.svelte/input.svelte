<script lang="ts">
  import Component from "./ts-slot-binding01-sveltev4-input-child.svelte";
</script>

<Component>
  <div let:foo={bar}>{bar.prop}</div>
</Component>
