<!-- eslint-disable svelte/valid-compile svelte/a11y_click_events_have_key_events  -->
<script lang="ts">
  import { CustomLine, type CustomComponentProps } from 'svelte-inspect-value'

  type Props = CustomComponentProps

  let { value, ...rest }: Props = $props()

  let doAnError = $state(false)
</script>

<CustomLine {value} {...rest}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <span class="value string" onclick={() => (doAnError = true)}>
    {value}
  </span>
  {#if doAnError}
    err
    <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
    {(value as any).doesNotExist.doesNotExist}
  {/if}
</CustomLine>
