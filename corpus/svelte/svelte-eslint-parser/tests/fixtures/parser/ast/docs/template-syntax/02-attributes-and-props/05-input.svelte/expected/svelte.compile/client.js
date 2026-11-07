import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input placeholder="This input field is not required"/> <div>This div has no title attribute</div>`, 1);

export default function _5_input($$anchor) {
	var fragment = root();
	var input = $.first_child(fragment);

	input.required = false;

	var div = $.sibling(input, 2);

	$.set_attribute(div, 'title', null);
	$.append($$anchor, fragment);
}