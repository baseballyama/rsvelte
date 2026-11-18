<script lang="ts" generics="T">
type Local<T> = { value: T };
type Props = { item: Local<string> };
let { item }: Props = $props();
</script>
<p>{item.value}</p>