<script>
	class Holder {
		field = new Map();

		static staticField = new Set();

		static {
			const inner = new Map();
			inner.set(1, 2);
		}

		method() {
			const d = new Date();
			d.setHours(1);
			return d;
		}
	}

	const h = new Holder();
	h.field.set(1, 2);
	Holder.staticField.add(1);
</script>

<p>{h.method()}</p>
