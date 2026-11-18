<script>
  export let label = ''
  let element = null
  let str = ''
  $: translate(label, {}, (r) => {
    str = r
  })

  // Focusable control with index
  export let focusIndex = -1
  const { idx } = registerFocus(focusIndex, { a: 1 })

  $: if (element) {
    element.addEventListener('focus', idx)
  }
</script>

<b>{str}{idx}{focusIndex}{element}</b>
