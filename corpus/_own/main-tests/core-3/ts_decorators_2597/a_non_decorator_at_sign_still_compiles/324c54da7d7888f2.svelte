<script lang="ts">
// @ts-expect-error
const s: number = 1;
</script>

<p>{s ? 'ok' : ''}</p>
