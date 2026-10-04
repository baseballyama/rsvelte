import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Globals_bind_this_mixed($$anchor) {
	let win = $.state(void 0);
	let n = $.state(0);
	var p = root();
	$.bind_this($.window, ($$value) => $.set(win, $$value, true), () => $.get(win));
	$.event('click', $.window, () => $.update(n));
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, $.get(n)));
	$.append($$anchor, p);
}
