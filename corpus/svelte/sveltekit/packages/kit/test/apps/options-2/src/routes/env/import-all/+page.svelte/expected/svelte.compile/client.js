import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as env from '$app/env/public';

var root = $.from_html(`<pre data-private=""> </pre> <pre data-public=""> </pre>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var pre = $.first_child(fragment);
	var text = $.only_child(pre, true);
	var pre_1 = $.sibling(pre, 2);
	var text_1 = $.only_child(pre_1, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[
			() => JSON.stringify($$props.data.env),
			() => JSON.stringify(env)
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}