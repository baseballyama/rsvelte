<script>
  export let label = ''
  let str = ''
  $: translate(label, (r) => {
    str = r
  })

  // C
  export let focusIndex = -1
  const { idx } = registerFocus(focusIndex, { a: 1 })

  $: if (idx) {
    str = 'x'
  }
</script>
<b>{str}{idx}{focusIndex}</b>
