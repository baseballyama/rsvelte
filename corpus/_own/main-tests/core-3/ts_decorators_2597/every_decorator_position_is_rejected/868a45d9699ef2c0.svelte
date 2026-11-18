<script lang="ts">
function f() { class C { @dec m() {} } return C; }
const s = f;
</script>

<p>{s ? 'ok' : ''}</p>
