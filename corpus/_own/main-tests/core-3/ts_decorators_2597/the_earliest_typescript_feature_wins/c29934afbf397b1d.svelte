<script lang="ts">
class C { @dec m() {} }
enum E { A }
const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
