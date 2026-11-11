<script lang="ts">
  const raw: unknown = 1; const id = <T>(x: T) => x; const n = <number>raw; const after = id(n);
</script>
<b>{after}</b>
