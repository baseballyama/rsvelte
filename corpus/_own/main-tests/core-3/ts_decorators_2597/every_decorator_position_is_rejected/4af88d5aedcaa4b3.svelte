<script lang="ts">
class C { @dec static m() {} }
const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
