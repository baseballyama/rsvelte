<script lang="ts">
interface P { x: number }
let { x } = $props<P>();
</script>
<p>{x}</p>