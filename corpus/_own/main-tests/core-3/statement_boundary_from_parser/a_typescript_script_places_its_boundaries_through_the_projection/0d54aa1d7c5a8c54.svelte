<script lang="ts">
  interface Props { label: string }
  let { label }: Props = $props();
  let count: number = $state(0);
  const doubled: number = $derived(count * 2);
</script>

<p>{label}{count}{doubled}</p>
