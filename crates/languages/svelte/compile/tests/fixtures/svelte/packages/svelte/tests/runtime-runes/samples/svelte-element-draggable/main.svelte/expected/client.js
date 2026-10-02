import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <div></div>`, 1);

export default function Main($$anchor) {
	let attrs = $.proxy({ draggable: 'false' });
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, () => 'div', false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ draggable: 'false' }));
	});

	var div = $.sibling(node, 2);

	$.attribute_effect(div, () => ({ ...attrs }));
	$.append($$anchor, fragment);
}