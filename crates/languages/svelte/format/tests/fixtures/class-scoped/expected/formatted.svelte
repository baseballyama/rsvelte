<script>
  let open = $state(false);
  let kind = $state("info");
</script>

<p class={kind}>expression</p>
<p class="note {kind}">interpolated</p>
<p class:open>directive only</p>
<p class="static" class:open>static and directive</p>
<p class={{ open }}>object</p>
<p class={"fixed & sure"}>literal</p>
<span class="plain">static</span>
<button onclick={() => (open = !open)}>toggle</button>

<style>
  p {
    margin: 0;
  }
  .open {
    font-weight: bold;
  }
  span {
    color: red;
  }
</style>
