<script lang="ts">
  import { addToPanel } from '$lib/index.js'
  // import { onDestroy } from 'svelte'
  import deepNest from '../deep-nest.js'

  addToPanel('nested', () => deepNest)

  let remove: () => void

  function add() {
    remove = addToPanel('nesteda', () => ({ ...deepNest }))
  }

  // onDestroy(() => {
  //   remove?.()
  // })

  $effect(() => {
    const cleanup = addToPanel('nestedc', () => ({ ...deepNest }))

    return cleanup
  })
</script>

<h2>Global Inspect</h2>

<button onclick={add}>add</button>

<button onclick={() => remove?.()}>remove</button>
