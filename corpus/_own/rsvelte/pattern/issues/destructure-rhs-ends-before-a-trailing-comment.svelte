<script>
  export let value
  let doc = undefined

  const load = (fn) => fn([value])
  load((res) => {
    ;[doc] = res
  /* } c */
  })
</script>

<p>{doc}</p>
