<script lang="ts">
  import { CustomExpandable, type CustomComponentProps } from '$lib/index.js'

  let { value, ...rest }: CustomComponentProps<number> = $props()

  let entries = $derived(
    Object.entries({
      base: value,
      timesTwo: value * 2,
      timesThree: value * 3,
    })
  )
</script>

<CustomExpandable {value} {...rest} length={entries.length} showLength={false} keepPreviewOnExpand>
  {#snippet valuePreview()}
    {value}
  {/snippet}
  multiples:
  <ul>
    {#each entries as [k, v], i (i)}
      <li>{k}: {v}</li>
    {/each}
  </ul>
</CustomExpandable>
