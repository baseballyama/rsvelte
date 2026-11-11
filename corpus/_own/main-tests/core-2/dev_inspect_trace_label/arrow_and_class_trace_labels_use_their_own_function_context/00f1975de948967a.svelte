<script>
	const g = () => {
		$inspect.trace();
	};

	class C {
		m() {
			$inspect.trace();
		}

		constructor() {
			$inspect.trace();
		}
	}
</script>
