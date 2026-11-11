<script lang="ts">
	class C {
		public static readonly a = 1;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
