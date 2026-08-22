<script>
	class C {
		#count = $state(0);
		#hidden = $state('h');
		n = $state(1);

		get count() {
			return this.#count;
		}

		set count(value) {
			this.#count = value;
		}
	}

	const c = new C();
</script>

<p>{c.count} {c.n}</p>
