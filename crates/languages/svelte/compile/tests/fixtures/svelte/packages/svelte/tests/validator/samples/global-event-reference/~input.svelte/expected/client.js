import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button> <button>click me</button> <button>click me</button> <button>click me</button>`, 1);

export default function Input($$anchor) {
	let onclick;
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.delegated('click', button, onclick);
	$.delegated('click', button_1, onclick);
	$.delegated('keydown', button_2, onkeydown);
	$.delegated('keydown', button_3, onkeydown);
	$.append($$anchor, fragment);
}

$.delegate(['click', 'keydown']);