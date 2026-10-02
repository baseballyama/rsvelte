import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => "script", false, ($$element, $$anchor) => {
		var text = $.text();

		text.nodeValue = '{}';
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}