<script lang="ts">
interface Q { z?: string }
interface P extends Q {
/** MARK */
m0?: string }
let p: P = $props();
</script>
<p>{p}</p>
