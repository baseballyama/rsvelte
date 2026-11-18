<script lang="ts">
type P = {
/** MARK */
[k in 'a' as `x${k}`]?: string };
let p: P = $props();
</script>
<p>{p}</p>
