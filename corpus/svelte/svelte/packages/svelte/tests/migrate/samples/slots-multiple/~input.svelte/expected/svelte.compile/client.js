import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><!></button> <button><!></button>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.child(button);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(button);

	var button_1 = $.sibling(button, 2);
	var node_1 = $.child(button_1);

	$.slot(node_1, $$props, 'default', {}, null);
	$.reset(button_1);
	$.append($$anchor, fragment);
}