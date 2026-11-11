<script>
  export let v;
  let k;
  $: k = (() => { return /[;{})(]/.test(String(v)); })();
</script>

<p>{k}</p>
