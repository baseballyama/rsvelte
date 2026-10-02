import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { toDisplayString } from 'vue';

var root = $.from_html(`<pre> </pre><p> </p><p> </p>`, 1);

export default function Interpolation_vue($$anchor, $$props) {
	$.push($$props, true);
	const object = { a: 1, b: [true, null] };
	const list = ['x', 'y'];
	const nothing = undefined;
	var fragment = root();
	var pre = $.first_child(fragment);
	var text = $.only_child(pre, true);
	var p = $.sibling(pre);
	var text_1 = $.only_child(p, true);
	var p_1 = $.sibling(p);
	var text_2 = $.only_child(p_1);
	$.template_effect(($0, $1, $2, $3) => {
		$.set_text(text, $0);
		$.set_text(text_1, $1);
		$.set_text(text_2, `[${$2 ?? ''}] [${$3 ?? ''}]`);
	}, [() => toDisplayString(object), () => toDisplayString(list), () => toDisplayString(nothing), () => toDisplayString(null)]);
	$.append($$anchor, fragment);
	$.pop();
}
