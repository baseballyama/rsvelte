<script>
  export let item;
  $: v = item.a ===
    1;
</script>

<p>{v}</p>
