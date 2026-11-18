<script lang="ts">
  let v = 1
  type Inner = { q: typeof v }
  type Props = { x: [string, Inner, number] }
  let p: Props = $props();
</script>
