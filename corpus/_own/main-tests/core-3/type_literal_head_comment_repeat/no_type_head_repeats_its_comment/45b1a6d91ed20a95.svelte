<script lang="ts">
type P = {
[k in 'a' | 'b']?:
/** MARK */
string };
let p: P = $props();
</script>
<p>{p}</p>
