<script module>
	class C {
		get private() { return 1; }
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
