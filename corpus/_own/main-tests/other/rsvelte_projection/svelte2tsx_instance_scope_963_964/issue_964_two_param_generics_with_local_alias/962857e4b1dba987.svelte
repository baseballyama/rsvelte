<script lang="ts" generics="L, R">
  type Q<A, B> = { a: A; b: B };
  let { q }: { q: Q<L, R> } = $props();
</script>
<span>{q.a}</span>
