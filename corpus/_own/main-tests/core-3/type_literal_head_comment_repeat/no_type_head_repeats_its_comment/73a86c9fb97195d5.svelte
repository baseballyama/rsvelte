<script lang="ts">
type F = new (
/** MARK */
a: string) => object;
type P = { z?: string };
let p: P = $props();
</script>
<p>{p}</p>
