<script lang="ts">
  import Component from "./ts-slot-binding01-sveltev4-input-child.svelte"; // Component: typeof SvelteComponent
</script>

<Component> <!-- Component: typeof SvelteComponent -->
  <div let:foo={bar}>{bar.prop}</div> <!-- bar: any, bar.prop: any -->
</Component>
