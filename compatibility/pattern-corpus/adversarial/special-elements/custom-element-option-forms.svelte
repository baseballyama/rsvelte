<svelte:options
  customElement={{
    tag: "my-widget",
    shadow: "none",
    props: {
      label: { attribute: "label", reflect: true, type: "String" },
      count: { attribute: "count", reflect: false, type: "Number" },
      flag: { type: "Boolean" },
    },
    extend: (customElementConstructor) => customElementConstructor,
  }}
/>

<script>
  let { label = "l", count = 0, flag = false } = $props();
</script>

<b>{label}{count}{flag}</b>
