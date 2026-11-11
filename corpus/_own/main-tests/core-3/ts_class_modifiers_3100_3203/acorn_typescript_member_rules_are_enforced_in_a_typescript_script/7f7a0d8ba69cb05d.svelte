<script lang="ts">
	class C {
		abstract m(): void;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
