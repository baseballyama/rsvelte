<script lang="ts">
  export type Phase = 'a' | 'b';
  interface Props { phase: Phase }
  let { phase }: Props = $props();
  const labels: Record<Phase, string> = { a: 'A', b: 'B' };
</script>
<span>{labels[phase]}</span>
