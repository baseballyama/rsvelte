<script>
  import Self from "./component-prop-name-shapes.svelte";

  let {
    depth = 0,
    class: className = "",
    for: forProp = "",
    default: defaultProp = 0,
    "data-x": dataX = 0,
    _underscore = 0,
    "with space": spaced = 0,
  } = $props();
</script>

{#if depth === 0}
  <Self
    depth={1}
    class="c"
    for="f"
    default={1}
    data-x={2}
    _underscore={3}
    with-space={4}
  />
{:else}
  <b>{className}{forProp}{defaultProp}</b>
  <b>{dataX}{_underscore}{spaced}</b>
{/if}
