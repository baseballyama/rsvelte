<script>
  export let a = 1;
  let out = "";
  $: {
    out =
      "x\
y" + a;
  }
</script>

<p>{out}</p>
