<script lang="ts">
type Leaf = string;
type Wrapper = { value: Leaf };
let { item }: { item: Wrapper } = $props();
</script>
<p>{item.value}</p>