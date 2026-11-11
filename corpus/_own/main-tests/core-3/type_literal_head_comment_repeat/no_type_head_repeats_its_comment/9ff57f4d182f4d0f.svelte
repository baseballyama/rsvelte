<script lang="ts">
type F = (
/** MARK */
a: string) => void;
type P = { z?: string };
let p: P = $props();
</script>
<p>{p}</p>
