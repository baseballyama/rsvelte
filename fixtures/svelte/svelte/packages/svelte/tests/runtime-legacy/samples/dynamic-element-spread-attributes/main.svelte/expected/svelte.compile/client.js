import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	let props = { id: "element", class: "element-handler" };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => "div", false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ ...props }));

		var text = $.text('this is a div');

		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}