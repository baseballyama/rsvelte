<script lang="ts">
enum E { A }
class C { @dec m() {} }
const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
