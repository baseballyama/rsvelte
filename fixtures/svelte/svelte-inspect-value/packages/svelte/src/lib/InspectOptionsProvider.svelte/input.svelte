<!--
  @component InspectOptionsProvider

  Provider-component for setting the global options context
-->
<script lang="ts">
  import type { Snippet } from 'svelte'
  import { setGlobalInspectOptions, type InspectOptions } from './options.svelte.js'

  type InspectOptionsProviderProps = {
    children: Snippet
    options: Partial<InspectOptions>
  }

  let { children, options }: InspectOptionsProviderProps = $props()

  setGlobalInspectOptions(() => options)
</script>

{@render children()}
