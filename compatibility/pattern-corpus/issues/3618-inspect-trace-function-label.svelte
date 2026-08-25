<script>
	const arrow = () => {
		$inspect.trace();
	};

	class Traced {
		method() {
			$inspect.trace();
		}

		constructor() {
			$inspect.trace();
		}
	}

	arrow();
	new Traced().method();
</script>
