<script lang="ts">
type P = { outer?: {
/** MARK */
inner?: string } };
let p: P = $props();
</script>
<p>{p}</p>
