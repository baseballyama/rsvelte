<script lang="ts">
  import type { X } from 'x';
  type Item = { n: number };
  let { a }: { a: X; i: Item } = $props();
</script>
{a}