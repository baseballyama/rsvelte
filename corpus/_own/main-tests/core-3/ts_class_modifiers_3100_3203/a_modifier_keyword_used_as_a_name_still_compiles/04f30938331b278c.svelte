<script module>
	class C {
		static { this.a = 1; }
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
