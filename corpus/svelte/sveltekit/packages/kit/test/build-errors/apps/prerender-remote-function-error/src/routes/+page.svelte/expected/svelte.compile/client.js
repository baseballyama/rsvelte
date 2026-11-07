import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { throws } from './data.remote.ts';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, throws, null, ($$anchor, value) => {
		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(value)));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
	$.pop();
}