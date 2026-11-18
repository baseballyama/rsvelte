<script module>
	let registry = new Map();

	export function register(id) {
		registry.set(id, true);
	}

	const shared = 'module';
</script>

<script>
	let { id = 'a' } = $props();
	const shadowedLater = shared;

	register(id);

	function shared2() {
		return shared + shadowedLater;
	}
</script>

<p>{shared2()}:{registry.size}</p>
<button onclick={() => register(id + '!')}>reg</button>
