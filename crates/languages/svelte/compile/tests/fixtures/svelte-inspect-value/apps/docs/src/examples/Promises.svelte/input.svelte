<script lang="ts">
  import { Inspect } from '@components'
  import { onMount } from 'svelte'

  let promises = $state.raw<Record<string, Promise<unknown>>>()

  function run(e?: MouseEvent) {
    if (e) e.stopPropagation()

    // promises = {}
    promises = {
      neverResolve: new Promise(() => {}),
      resolveInAFew: new Promise((resolve) => {
        setTimeout(() => {
          resolve('yep')
        }, 2000)
      }),
      rejectsInAFew: new Promise((_, reject) => {
        setTimeout(() => {
          reject('nope')
        }, 3500)
      }),
    }
  }

  onMount(run)
</script>

{#if promises}
  <Inspect values={promises}>
    {#snippet heading()}
      <button onclick={run}>rerun</button>
    {/snippet}
  </Inspect>
{/if}
