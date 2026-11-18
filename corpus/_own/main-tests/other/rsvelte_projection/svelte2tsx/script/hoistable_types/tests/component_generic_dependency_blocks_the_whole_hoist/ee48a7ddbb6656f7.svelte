<script lang="ts" generics="T">
type Box = { value: T };
interface Props { box: Box }
let { box }: Props = $props();
</script>
<p>{box.value}</p>