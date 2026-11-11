<script lang="ts">
type F = (a: string,
/** MARK */
b: string) => void;
type P = { z?: string };
let p: P = $props();
</script>
<p>{p}</p>
