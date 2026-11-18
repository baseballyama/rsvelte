<script module lang="ts">
type Shared = { module: true };
</script>
<script lang="ts">
type Shared = { instance: true };
interface Props { value: Shared }
let { value }: Props = $props();
</script>
<p>{value}</p>