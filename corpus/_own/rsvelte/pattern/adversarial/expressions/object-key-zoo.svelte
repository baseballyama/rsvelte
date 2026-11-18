<script>
	const key = 'dyn';
	let store = $state({
		plain: 1,
		'quoted key': 2,
		123: 3,
		[key]: 4,
		[`tpl-${key}`]: 5,
		get computed() {
			return this.plain + 1;
		},
		set computed(v) {
			this.plain = v - 1;
		},
		nested: { deep: { deeper: 6 } },
		method() {
			return 7;
		},
		async asyncMethod() {
			return 8;
		},
		*gen() {
			yield 9;
		}
	});
</script>

<button onclick={() => (store.computed = 10)}>
	{store.plain}{store['quoted key']}{store[123]}{store[key]}{store.nested.deep.deeper}{store.method()}
</button>
