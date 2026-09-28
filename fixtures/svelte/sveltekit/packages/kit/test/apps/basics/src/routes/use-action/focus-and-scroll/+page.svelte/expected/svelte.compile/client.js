import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { disableScrollHandling } from '$app/navigation';

var root = $.from_html(`<div>They (don't) see me scrollin'...</div> <div style="height: 180vh; background-color: peru;"><label for="input">Focus!</label> <input id="input" type="text"/></div> <div style="height: 180vh; background-color: teal;">They (not) focusin'</div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const focusAndScroll = /** @param {HTMLInputElement} node */ (node) => {
		disableScrollHandling();
		node.focus();
		node.scrollIntoView();
	};

	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var input = $.sibling($.child(div), 2);

	$.action(input, ($$node) => focusAndScroll?.($$node));
	$.reset(div);
	$.next(2);
	$.append($$anchor, fragment);
	$.pop();
}