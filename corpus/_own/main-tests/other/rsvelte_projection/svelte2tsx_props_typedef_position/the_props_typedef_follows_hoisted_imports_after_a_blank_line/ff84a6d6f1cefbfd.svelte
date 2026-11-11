<script lang="ts">
  import type { X } from 'x';
  let { a }: { a: X } = $props();
</script>
{#snippet foo()}<p>hi</p>{/snippet}
{@render foo()}{a}