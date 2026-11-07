<script lang="ts">
  import { browser } from '$app/environment'
  import Ace from './Ace.svelte'
  import type { AceProps } from './aceprops.js'

  let props: AceProps = $props()

  let ace = $state<ReturnType<typeof Ace>>()

  export function editor() {
    return ace
  }
</script>

<svelte:boundary>
  {#if browser}
    <Ace bind:this={ace} {...props} />
  {/if}
</svelte:boundary>
