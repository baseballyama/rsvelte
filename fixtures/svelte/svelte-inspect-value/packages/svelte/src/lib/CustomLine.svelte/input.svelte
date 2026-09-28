<script lang="ts" generics="T = unknown, Type = string | undefined">
  import type { Snippet } from 'svelte'
  import OneLineView from './components/OneLineView.svelte'
  import type { CustomComponentProps } from './types.js'
  import { type ValueType } from './util.js'

  let { type, ...props }: CustomComponentProps<T, Type> & { children?: Snippet } = $props()
</script>

<OneLineView type={type as unknown as ValueType} {...props} />
