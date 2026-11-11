<script lang="ts">
class C { @dec({ n: 1 }) m() {} }
const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
