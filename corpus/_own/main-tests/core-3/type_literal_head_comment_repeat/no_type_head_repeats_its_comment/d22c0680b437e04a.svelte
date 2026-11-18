<script lang="ts">
type P = {
/** MARK */
[k in 'a' | 'b']?: string };
let p: P = $props();
</script>
<p>{p}</p>
