<script lang="ts" generics="L">
  type Wrapper<A> = { value: A };
  let { item }: { item: Wrapper<L> } = $props();
</script>
<span>{item.value}</span>
