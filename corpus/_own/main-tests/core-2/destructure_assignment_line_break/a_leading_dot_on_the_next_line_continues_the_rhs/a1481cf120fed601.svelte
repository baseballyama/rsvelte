<script>
  let rows = []

  function load (result) {
    ;[rows] = result
      .filter(Boolean)
    done = true
  }

  let done = false
</script>

<button onclick={() => load([1])}>{rows.length}{done}</button>
