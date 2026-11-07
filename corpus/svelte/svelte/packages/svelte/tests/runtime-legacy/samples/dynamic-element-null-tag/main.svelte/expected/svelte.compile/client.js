import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	let tag = null;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => tag, false, ($$element, $$anchor) => {
		var text = $.text('Foo');

		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}