<script lang="ts">
class C { @ns.dec m() {} }
const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
