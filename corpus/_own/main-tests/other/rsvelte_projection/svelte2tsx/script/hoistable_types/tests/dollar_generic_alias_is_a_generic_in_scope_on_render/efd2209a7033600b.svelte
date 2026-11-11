<script lang="ts">
  type T = $$Generic
  interface Props { a: T }
  let { a }: Props = $props();
</script>
