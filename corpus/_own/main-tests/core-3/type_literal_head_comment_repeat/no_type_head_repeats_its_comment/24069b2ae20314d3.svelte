<script lang="ts">
interface P { m: (
/** MARK */
a: string) => void }
let p: P = $props();
</script>
<p>{p}</p>
