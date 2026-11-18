<script>
	const arrow = () => {
		$inspect.trace();
	};

	async function async_trace() {
		$inspect.trace();
		return arrow;
	}

	class Traced {
		method() {
			$inspect.trace();
		}

		constructor() {
			$inspect.trace();
		}
	}

	arrow();
	async_trace();
	new Traced().method();
</script>
