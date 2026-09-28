import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { page } from '$app/state';

var root = $.from_html(`<input id="input" type="text"/>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var input = root();

	$.remove_input_defaults(input);
	$.template_effect(($0) => $.set_value(input, $0), [() => page.url.searchParams.get('foo')]);

	$.event('input', input, (e) => {
		goto('?foo=' + e.currentTarget?.value, { reset: false });
	});

	$.append($$anchor, input);
	$.pop();
}