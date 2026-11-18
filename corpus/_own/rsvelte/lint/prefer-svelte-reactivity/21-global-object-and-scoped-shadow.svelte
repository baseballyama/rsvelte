<script>
	const a = new window.Date();
	a.setHours(0);

	const b = new self.Set();
	b.add(1);

	function scoped() {
		class Map {
			set() {}
		}
		const m = new Map();
		m.set(1, 2);
		return m;
	}

	function global() {
		const m = new Map();
		m.set(1, 2);
		return m;
	}
</script>

<p>{a}{b}{scoped()}{global()}</p>
