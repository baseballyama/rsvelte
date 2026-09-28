import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p class="before svelte-1dexvva">before</p> <!> <p class="foo svelte-1dexvva"><span class="svelte-1dexvva">foo</span></p> <p class="bar svelte-1dexvva">bar</p></div> <!>`, 1);

export default function Input($$anchor) {
	let tag = 'div';
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	$.element(node, () => tag, false, ($$element, $$anchor) => {
		$.set_class($$element, 0, 'x svelte-1dexvva');
	});

	$.next(4);
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	$.each(node_1, 16, () => [1], $.index, ($$anchor, $$item) => {
		var fragment_1 = $.comment();
		var node_2 = $.first_child(fragment_1);

		$.element(node_2, () => tag, false, ($$element_1, $$anchor) => {
			$.set_class($$element_1, 0, 'z svelte-1dexvva');
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}