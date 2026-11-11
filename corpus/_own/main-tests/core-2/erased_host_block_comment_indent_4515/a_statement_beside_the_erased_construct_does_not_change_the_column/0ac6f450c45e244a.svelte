<script lang="ts">
  const k = 1;
  interface P {
    /**
     * two
     */
    a: number
  }
  let { a }: P = $props()
</script>
<i>{a}{k}</i>
