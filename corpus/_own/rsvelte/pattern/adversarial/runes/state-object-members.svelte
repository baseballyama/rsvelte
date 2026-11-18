<script>
	let counterName = $state('hits');
	let stats = $state({
		hits: 0,
		get label() {
			return `${this.hits} hits`;
		},
		set label(v) {
			this.hits = Number.parseInt(v, 10) || 0;
		},
		['computed-' + 1]: true,
		async fetch() {
			return this.hits;
		},
		*iterate() {
			yield this.hits;
		},
		async *stream() {
			yield await this.fetch();
		},
	});
</script>

<button onclick={() => (stats[counterName] += 1)}>{stats.label}</button>
<button onclick={() => (stats.label = '10')}>set</button>
