<script>
  export let selected

  function pick (result) {
    ;[selected] = result
    done = true
  }

  let done = false
</script>

<button onclick={() => pick([1])}>{selected}{done}</button>
