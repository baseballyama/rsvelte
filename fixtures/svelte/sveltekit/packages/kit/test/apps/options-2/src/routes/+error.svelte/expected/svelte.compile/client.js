import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { resolve, asset } from '$app/paths';

var root = $.from_html(`<h1 data-testid="error-status"> </h1> <p data-testid="base"> </p> <p data-testid="assets"> </p>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_2 = $.only_child(p_1);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, page.status);
			$.set_text(text_1, `base: ${$0 ?? ''}`);
			$.set_text(text_2, `assets: ${$1 ?? ''}`);
		},
		[
			() => resolve(''),
			() => asset('answer.txt').replace('answer.txt', '')
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}