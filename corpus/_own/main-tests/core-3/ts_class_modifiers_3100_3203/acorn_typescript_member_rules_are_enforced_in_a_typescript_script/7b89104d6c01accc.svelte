<script lang="ts">
	class C {
		static override m() {}
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
