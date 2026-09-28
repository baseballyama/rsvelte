<script lang="ts">
  import { CustomLine, type CustomComponentProps } from 'svelte-inspect-value'

  let { value, ...rest }: CustomComponentProps<number> = $props()
</script>

<CustomLine {value} {...rest}>
  <!-- the "value" and "number" css classes are internally defined -->
  <span class="value number">{value}</span>
</CustomLine>

<style>
  span {
    rotate: 180deg;
  }
</style>
