<script>
	class Counter {
		static #instances = 0;
		static registry = [];

		static {
			Counter.registry.push('init');
		}

		#count = $state(0);
		label = $state('c');
		accessor = 'a field literally named accessor';

		constructor() {
			Counter.#instances += 1;
		}

		get count() {
			return this.#count;
		}

		set count(v) {
			this.#count = v;
		}

		#bump() {
			this.#count += 1;
		}

		bump = () => this.#bump();

		static get instances() {
			return Counter.#instances;
		}
	}

	const c = new Counter();
</script>

<button onclick={c.bump}>
	{c.count}
	{c.label}
	{c.accessor}
	{Counter.instances}
	{Counter.registry.length}
</button>
