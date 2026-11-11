<script module>
	class C {
		#a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
