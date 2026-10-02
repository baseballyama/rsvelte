import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve, asset } from '$app/paths';

var root = $.from_html(`<a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a> <a>Click me!</a>`, 1);

export default function Link_ternary_resolve_asset01_input($$anchor, $$props) {
	$.push($$props, true);

	const condition = true;
	const url = condition ? resolve('/foo') : asset('/bar');
	const assetUrl = asset('/bar');
	var fragment = root();
	var a = $.first_child(fragment);
	var a_1 = $.sibling(a, 2);
	var a_2 = $.sibling(a_1, 2);
	var a_3 = $.sibling(a_2, 2);
	var a_4 = $.sibling(a_3, 2);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(a_1, 'href', $1);
			$.set_attribute(a_2, 'href', $2);
			$.set_attribute(a_3, 'href', url);
			$.set_attribute(a_4, 'href', $3);
		},
		[
			() => condition ? resolve('/foo') : asset('/bar'),
			() => condition ? asset('/bar') : resolve('/foo'),
			() => condition ? asset('/foo') : asset('/bar'),
			() => condition ? resolve('/foo') : assetUrl
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}