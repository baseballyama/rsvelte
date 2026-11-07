<script lang="ts">
  import Component from "./ts-slot-binding01-input-child.svelte"; // Component: __sveltets_2_IsomorphicComponent<any, { [evt: string]: CustomEvent<any>; }, { default: { foo: { prop: boolean; }; }; }, Record<string, any>, string>
</script>

<Component> <!-- Component: __sveltets_2_IsomorphicComponent<any, { [evt: string]: CustomEvent<any>; }, { default: { foo: { prop: boolean; }; }; }, Record<string, any>, string> -->
  <div let:foo={bar}>{bar.prop}</div> <!-- bar: { prop: boolean; }, bar.prop: boolean -->
</Component>
