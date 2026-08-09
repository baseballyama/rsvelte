<script>
  let { item } = $props();

  function rename() {
    item.name = "\\";
  }

  function other() {
    item.count = 1;
  }
</script>

<button onclick={rename}>{item.name}</button>
<button onclick={other}>{item.count}</button>
