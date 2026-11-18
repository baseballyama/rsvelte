<script lang="ts">
	class C {
		override a = 1;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
