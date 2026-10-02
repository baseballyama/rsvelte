import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve, asset } from '$app/paths';

var root = $.from_html(`<h1>Hello</h1> <p data-testid="base"> </p> <p data-testid="assets"> </p> <a data-testid="link" class="svelte-1vpch45">Go to /hello</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var a = $.sibling(p_1, 2);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, `base: ${$0 ?? ''}`);
			$.set_text(text_1, `assets: ${$1 ?? ''}`);
			$.set_attribute(a, 'href', $2);
		},
		[
			() => resolve(''),
			() => asset('answer.txt').replace('answer.txt', ''),
			() => resolve('/hello')
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}