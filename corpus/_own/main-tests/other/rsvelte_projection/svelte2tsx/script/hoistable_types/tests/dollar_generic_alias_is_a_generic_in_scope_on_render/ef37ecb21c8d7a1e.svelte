<script lang="ts">
  type T = $$Generic
  interface Props { a: string }
  let { a }: Props = $props();
  let u: T | undefined = undefined;
</script>
