<script>
	const items = [{ p: 1 }, { p: 2 }];
	for (let top of items) {
		void top;
	}
	for (let key in items[0]) {
		void key;
	}
	for (let { p } of items) {
		void p;
	}
	for (let [head, tail] of [[1, 2]]) {
		void [head, tail];
	}
	for (let written of items) {
		written = null;
		void written;
	}
	for (const already of items) {
		void already;
	}
	let bare;
	for (bare of items) {
		void bare;
	}
	function nested() {
		for (let inner of items) {
			void inner;
		}
	}
	void nested;
</script>
<p>for-of / for-in heads declare without an initializer</p>
