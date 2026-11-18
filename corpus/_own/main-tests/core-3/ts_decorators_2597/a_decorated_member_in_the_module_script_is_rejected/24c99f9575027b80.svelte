<script module lang="ts">
class C { @dec m() {} }
export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
