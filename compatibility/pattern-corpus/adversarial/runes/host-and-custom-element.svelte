<svelte:options
  customElement={{
    tag: "my-counter",
    shadow: "open",
    props: { count: { reflect: true, type: "Number", attribute: "count" } },
  }}
/>

<script>
  let { count = 0 } = $props();

  function emit() {
    $host().dispatchEvent(new CustomEvent("changed", { detail: count }));
  }
</script>

<button onclick={emit}>{count}</button>
