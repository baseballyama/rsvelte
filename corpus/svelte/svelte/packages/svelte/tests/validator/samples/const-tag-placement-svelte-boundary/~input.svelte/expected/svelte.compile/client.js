import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <!>`, 1);

export default function Input($$anchor) {
	let a = "";
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.boundary(node, {}, ($$anchor) => {
		const x = $.derived(() => a);

		$.next();

		var fragment_1 = root();
		var text = $.first_child(fragment_1);

		text.nodeValue = `${$.get(x) ?? ''} `;

		var node_1 = $.sibling(text);

		FlakyComponent(node_1, {});
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}