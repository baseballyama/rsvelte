<script>
	const top = new Map();
	top.set('a', 1);

	function inner() {
		class Map {
			set() {}
		}
		const local = new Map();
		local.set('b', 2);
		return local;
	}

	const r = inner();
</script>

<p>{top.size} {String(r)}</p>
