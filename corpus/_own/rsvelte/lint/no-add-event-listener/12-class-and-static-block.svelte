<script>
	class Widget extends EventTarget {
		constructor() {
			super();
			super.addEventListener('a', () => {});
			this.addEventListener('b', () => {});
		}

		static {
			document.addEventListener('c', () => {});
		}

		field = window.addEventListener('d', () => {});
	}

	const w = new Widget();
</script>

<p>{w}</p>
