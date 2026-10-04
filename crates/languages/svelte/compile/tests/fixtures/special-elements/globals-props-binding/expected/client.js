import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Globals_props_binding($$anchor, $$props) {
	$.push($$props, true);
	let width = $.prop($$props, 'width', 15), x = $.prop($$props, 'x', 15);
	$.bind_window_size('innerWidth', width);
	$.bind_window_scroll('x', x);
	$.pop();
}
