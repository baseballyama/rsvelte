<script>
	let {
		search = (input) => input.length,
		format = function change(chunk) {
			return String(chunk);
		},
		load = () => {
			const focus = 1;
			return focus;
		},
		guard = () => {
			try {
				return 0;
			} catch (keydown) {
				return keydown;
			}
		},
	} = $props();

	let handled = $state(0);
</script>

<div
	oninput={() => { handled = search('x'); }}
	onchange={() => { handled = format(1).length; }}
	onfocus={() => { handled = load(); }}
	onkeydown={() => { handled = guard(); }}
></div>
