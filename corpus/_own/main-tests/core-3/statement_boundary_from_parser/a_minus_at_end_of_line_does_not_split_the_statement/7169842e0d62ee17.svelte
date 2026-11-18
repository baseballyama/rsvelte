<script>
  export let a = 1;
  export let b = 2;
  let n = 0;
  $: v = a -
    b;
</script>

<p>{v}{n}</p>
