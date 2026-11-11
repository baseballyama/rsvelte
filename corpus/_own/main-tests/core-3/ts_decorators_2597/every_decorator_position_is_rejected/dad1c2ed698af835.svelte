<script lang="ts">
class C { @dec x = 1; }
const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
