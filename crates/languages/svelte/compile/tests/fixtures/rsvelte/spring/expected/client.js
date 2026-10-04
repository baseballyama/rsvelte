import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { Spring } from 'svelte/motion';

var root = $.from_html(`<p> </p>`);

export default function Spring_1($$anchor, $$props) {
	$.push($$props, true);
	const size = new Spring(10);
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, size.current));
	$.append($$anchor, p);
	$.pop();
}
