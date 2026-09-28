import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';

var root = $.from_html(`<a> </a>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var a = root();
	var text = $.only_child(a, true);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(a, 'href', $0);
			$.set_text(text, $1);
		},
		[
			() => resolve('/trailing-slash-server/prerender'),
			() => resolve('/trailing-slash-server/prerender')
		]
	);

	$.append($$anchor, a);
	$.pop();
}