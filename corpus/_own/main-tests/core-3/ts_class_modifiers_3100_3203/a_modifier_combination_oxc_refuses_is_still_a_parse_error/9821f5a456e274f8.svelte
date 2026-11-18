<script module>
	class C {
		declare accessor a;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
