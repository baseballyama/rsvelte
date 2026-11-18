<script lang="ts">
class C { @dec get x() { return 1; } }
const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
