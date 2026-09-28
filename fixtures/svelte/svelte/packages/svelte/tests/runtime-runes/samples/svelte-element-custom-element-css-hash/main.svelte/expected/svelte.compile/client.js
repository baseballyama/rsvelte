import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <custom-element></custom-element>`, 3);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, () => 'custom-element', false, ($$element, $$anchor) => {
		$.set_class($$element, 0, 'red svelte-5ruto1');
	});

	var custom_element = $.sibling(node, 2);

	$.set_class(custom_element, 1, 'red svelte-5ruto1');
	$.append($$anchor, fragment);
}