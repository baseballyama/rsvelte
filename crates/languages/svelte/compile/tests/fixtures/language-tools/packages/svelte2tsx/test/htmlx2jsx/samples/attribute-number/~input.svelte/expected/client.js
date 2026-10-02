import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <div tabindex="1" maxlength="1" role="none"></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	SomeComponent(node, { tabindex: '1' });

	var div = $.sibling(node, 2);

	$.set_attribute(div, 'minlength', 1);
	$.set_attribute(div, 'span', 1);
	$.append($$anchor, fragment);
}