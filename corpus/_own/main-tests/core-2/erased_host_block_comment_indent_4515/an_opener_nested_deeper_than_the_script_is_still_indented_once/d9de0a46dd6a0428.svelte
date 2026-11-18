<script lang="ts">
  interface P {
    /**
     * two
     */
    a: number
  }
  let { a }: P = $props()
</script>
<i>{a}</i>
