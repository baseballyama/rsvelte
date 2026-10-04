<script>
  let serial = 0;
  let count = $state(0);
  let visible = $state(true);
  function next() { return ++serial; }
</script>
<button onclick={() => count++}>change</button>
<button onclick={() => visible = !visible}>toggle</button>
<p title={next()} data-number={next()}>{next()}:{count}</p>
<section title={next()}><b title={next()}>{next()}:{count}</b></section>
{#if visible}<i title={next()}>{next()}:{count}</i>{/if}
