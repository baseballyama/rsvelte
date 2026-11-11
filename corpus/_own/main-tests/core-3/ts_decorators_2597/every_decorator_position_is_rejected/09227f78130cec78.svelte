<script lang="ts">
class C { @a @b m() {} }
const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
