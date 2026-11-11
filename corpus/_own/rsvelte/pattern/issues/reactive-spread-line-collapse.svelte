<script>
  export let cardIds = []
  let a = 1
  $: if (cardIds.length > 0) {
    query({
      // a line comment the spread must not be joined onto
      ...(a ? {} : { b: 1 }),
      ...(a ? { d: 2 } : {})
    })
  }
</script>

<b>{cardIds}{a}</b>
