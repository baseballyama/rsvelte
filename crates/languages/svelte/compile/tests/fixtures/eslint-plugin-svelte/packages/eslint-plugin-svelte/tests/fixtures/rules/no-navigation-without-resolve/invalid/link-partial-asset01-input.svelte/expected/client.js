import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { asset } from '$app/paths';

var root = $.from_html(`<a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_partial_asset01_input($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var a = $.first_child(fragment);
	var a_1 = $.sibling(a, 2);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(a_1, 'href', $1);
		},
		[() => asset('/foo') + '/bar', () => '/foo' + asset('/bar')]
	);

	$.append($$anchor, fragment);
	$.pop();
}