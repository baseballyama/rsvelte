<script lang="ts">
@dec class C {}
const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
