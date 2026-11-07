import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<textarea readonly=""></textarea> <textarea></textarea>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var textarea = $.sibling($.first_child(fragment), 2);

	$.set_attribute(textarea, 'autocomplete', 'no');
	$.append($$anchor, fragment);
}