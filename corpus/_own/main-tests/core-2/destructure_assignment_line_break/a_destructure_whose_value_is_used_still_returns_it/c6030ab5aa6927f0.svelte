<script>
  export let selected
  let out = null

  function pick (result) {
    out = ([selected] = result)
  }
</script>

<button onclick={() => pick([1])}>{selected}{out}</button>
