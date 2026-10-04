import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Globals_bindings($$anchor) {
	let w = $.state(0);
	let scroll = $.state(0);
	let online = $.state(true);
	let active = $.state(null);
	let visibility = $.state("visible");
	let ratio = $.state(1);
	var p = root();
	var text = $.only_child(p);
	$.template_effect(() => $.set_text(text, `${$.get(w) ?? ''} ${$.get(scroll) ?? ''} ${$.get(online) ?? ''} ${$.get(active) ?? ''} ${$.get(visibility) ?? ''} ${$.get(ratio) ?? ''}`));
	$.bind_window_size('innerWidth', ($$value) => $.set(w, $$value, true));
	$.bind_window_scroll('y', () => $.get(scroll), ($$value) => $.set(scroll, $$value, true));
	$.bind_online(($$value) => $.set(online, $$value, true));
	$.bind_property('devicePixelRatio', 'resize', $.window, ($$value) => $.set(ratio, $$value, true));
	$.bind_active_element(($$value) => $.set(active, $$value, true));
	$.bind_property('visibilityState', 'visibilitychange', $.document, ($$value) => $.set(visibility, $$value, true));
	$.append($$anchor, p);
}
