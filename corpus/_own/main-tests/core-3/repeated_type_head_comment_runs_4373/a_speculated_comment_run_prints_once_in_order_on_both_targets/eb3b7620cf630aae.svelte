<script module lang="ts">
type Q = {
  // c
  // d
  b: number;
};
export const q: Q = { b: 1 };
</script>
<script lang="ts">
let { a } = $props();
</script>
<i>{a}</i>
