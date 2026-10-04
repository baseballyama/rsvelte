import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Globals_function_binding($$anchor) {
	let x = $.state(0);
	function get() {
		return $.get(x);
	}
	function set(value) {
		$.set(x, value, true);
	}
	$.bind_window_scroll('x', get, set);
}
