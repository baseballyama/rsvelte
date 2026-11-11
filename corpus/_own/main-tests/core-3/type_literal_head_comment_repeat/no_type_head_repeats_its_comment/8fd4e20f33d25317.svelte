<script lang="ts">
type P = {
f?: () => void;
/** MARK */
m1?: string };
let p: P = $props();
</script>
<p>{p}</p>
