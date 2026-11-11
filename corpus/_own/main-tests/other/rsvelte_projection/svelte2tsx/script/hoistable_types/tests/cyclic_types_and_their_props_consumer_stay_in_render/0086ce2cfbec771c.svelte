<script lang="ts">
type A = B;
type B = A;
interface Props { value: A }
let { value }: Props = $props();
</script>
<p>{value}</p>