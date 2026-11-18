<script lang="ts">
@outer class C { @inner m() {} }
const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
