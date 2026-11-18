<script>
	const emitter = { subscribe: (fn) => fn, unsubscribe: () => {} };
	const nested = { deep: { subscribe: (fn) => fn } };
	emitter.subscribe(() => {});
	nested.deep.subscribe(() => {});
	emitter.unsubscribe?.();
</script>

<p>{typeof emitter}</p>
