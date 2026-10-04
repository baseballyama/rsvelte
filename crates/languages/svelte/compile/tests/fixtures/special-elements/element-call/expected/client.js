import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Element_call($$anchor) {
	function tag() {
		return "p";
	}
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.element(node, tag, false, ($$element, $$anchor) => {
		var text = $.text('hello');
		$.append($$anchor, text);
	});
	$.append($$anchor, fragment);
}
