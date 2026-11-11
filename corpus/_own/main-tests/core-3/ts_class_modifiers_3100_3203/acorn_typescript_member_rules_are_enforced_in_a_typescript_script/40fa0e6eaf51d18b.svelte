<script lang="ts">
	class C {
		protected override m() {}
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
