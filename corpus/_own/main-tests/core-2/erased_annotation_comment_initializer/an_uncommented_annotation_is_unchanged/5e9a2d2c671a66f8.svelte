<script>
  export let n = 0;
  let tabs = [];
  $: {
    tabs = [{ a: "x", b: n }];
  }
</script>

<p>{tabs.length}</p>
