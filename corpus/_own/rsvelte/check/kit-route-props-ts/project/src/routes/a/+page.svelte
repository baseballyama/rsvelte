<script lang="ts">
  let { data, foo = 1, form } = $props();
  const n: number = data.x;
  const s: string = foo;
  [1].find((r) => r);
  ([] as any[]).map((q) => q);
</script>
