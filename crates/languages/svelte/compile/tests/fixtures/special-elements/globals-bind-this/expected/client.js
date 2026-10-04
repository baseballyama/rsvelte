import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Globals_bind_this($$anchor) {
	let win = $.state(void 0);
	let doc = $.state(void 0);
	let body = $.state(void 0);
	$.bind_this($.window, ($$value) => $.set(win, $$value, true), () => $.get(win));
	$.bind_this($.document, ($$value) => $.set(doc, $$value, true), () => $.get(doc));
	$.bind_this($.document.body, ($$value) => $.set(body, $$value, true), () => $.get(body));
}
