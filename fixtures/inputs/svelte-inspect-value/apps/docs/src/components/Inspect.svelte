<script lang="ts">
  import Inspect, { type InspectProps } from 'svelte-inspect-value'
  import { globalOpts } from './global-opts/globalopts.svelte'

  let props: InspectProps = $props()

  let fwd = $derived({ ...globalOpts, ...props })
</script>

<Inspect {...fwd} class="not-content mt" />
