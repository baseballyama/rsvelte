<script module>
	class C {
		static override m() {}
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
