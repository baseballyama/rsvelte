import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`﻿ <p></p>`, 1);

export default function Byte_order_mark($$anchor) {
	let x = "a";
	$.next();
	var fragment = root();
	var p = $.sibling($.first_child(fragment));
	p.textContent = 'a';
	$.append($$anchor, fragment);
}
