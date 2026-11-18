<script lang="ts">
class C { constructor(@dec a: number) {} }
const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
