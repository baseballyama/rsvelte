<script lang="ts">
  import { CustomLine, type CustomComponentProps } from '$lib/index.js'

  let { value, ...rest }: CustomComponentProps<number> = $props()
</script>

<CustomLine {value} {...rest}>
  <span class="value number">{value}</span>
</CustomLine>

<style>
  span {
    rotate: 180deg;
  }
</style>
