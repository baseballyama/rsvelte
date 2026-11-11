<script lang="ts">
  export let n = 0;

  let tabs: {
    a: string;
    // svelte-ignore a11y_no_static_element_interactions
    b: number;
  }[] = [];

  $: {
    tabs = [{ a: "x", b: n }];
  }
</script>

<p>{tabs.length}</p>
