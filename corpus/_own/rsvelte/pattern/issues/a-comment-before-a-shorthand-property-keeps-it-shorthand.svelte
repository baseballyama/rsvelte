<script>
  import { writable } from 'svelte/store'

  const width = writable(1)
  const height = writable(2)
  const debug = true

  $: if (debug) {
    console.debug({
      $width,
      /* c */
      $height
    })
  }
</script>

<p>{$width}</p>
