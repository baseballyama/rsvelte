<script>
  let w = 0
  let obj = {}
  $: obj = { a: w }
  function f (n) {
    w = n
  }
</script>
<p>{obj.a}</p>
