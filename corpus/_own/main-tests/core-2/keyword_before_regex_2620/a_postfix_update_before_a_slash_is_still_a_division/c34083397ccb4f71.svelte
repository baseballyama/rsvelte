<script>
  export let v;
  let k;
  $: k = (() => { let n = Number(v); return n++ / 2 / 4; })();
</script>

<p>{k}</p>
