<script>
  import Component from './Component.svelte'
  const b = 42
</script>
<Component>
  {@const a = b * 2}
  {a}
</Component>
