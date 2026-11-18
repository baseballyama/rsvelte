<script>
	let s = $state(0);

	function shapes(o, t) {
		return [
			() => void (o.a = String(t)),
			() => void (o.b = Math.round(t)),
			() => void (o.c = Math.PI),
			() => void (o.d = () => t),
			() => void (o.e = [t]),
			() => void (o.f = { t }),
			() => void (o.g = new Date())
		];
	}
</script>

<button onclick={() => s++}>{s}{shapes}</button>
