<script context="module" lang="ts">
  export const answer: number = 42;
</script>
<script lang="ts">
  let { label = "count", value = $bindable(0) }: {
    label?: string;
    value?: number;
  } = $props();
  const doubled = $derived(value * 2);
</script>
<button onclick={() => value++}>{label}: {value} / {doubled}</button>
<style>button { color: rebeccapurple; }</style>