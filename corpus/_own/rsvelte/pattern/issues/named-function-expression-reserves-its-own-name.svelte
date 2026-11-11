<script>
	let handled = $state(0);

	const wrap = () => {
		const inner = function change(chunk) {
			return String(chunk);
		};

		return inner;
	};
</script>

<div
	onchange={() => {
		handled = wrap()(1).length;
	}}
	oninput={() => {
		handled = 1;
	}}
></div>
