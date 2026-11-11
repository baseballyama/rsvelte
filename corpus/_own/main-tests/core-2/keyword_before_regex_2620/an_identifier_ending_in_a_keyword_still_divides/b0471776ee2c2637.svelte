<script>
  export let v;
  let k;
  $: k = (() => { const preturn = Number(v); return preturn / 2 / 4; })();
</script>

<p>{k}</p>
