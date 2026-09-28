import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <dialog></dialog> <dialog><input/></dialog>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.autofocus(div, true);

	var dialog = $.sibling(div, 2);

	$.autofocus(dialog, true);

	var dialog_1 = $.sibling(dialog, 2);
	var input = $.child(dialog_1);

	$.autofocus(input, true);
	$.reset(dialog_1);
	$.append($$anchor, fragment);
}