<script lang="ts">
type T = string extends
/** MARK */
string ? 1 : 2;
type P = { z?: string };
let p: P = $props();
</script>
<p>{p}</p>
