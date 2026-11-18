<script lang="ts">
type Q<T> = T;
type T = Q<
/** MARK */
string>;
type P = { z?: string };
let p: P = $props();
</script>
<p>{p}</p>
