<script lang="ts" generics="T = unknown">
  import type { ComponentProps } from 'svelte'
  import Expandable from './components/Expandable.svelte'
  import type { CustomComponentProps } from './types.js'

  let props: CustomComponentProps<T> & ComponentProps<typeof Expandable> = $props()
</script>

<Expandable {...props} />
