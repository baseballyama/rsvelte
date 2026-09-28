import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let is_open = $.prop($$props, 'open', 15);

	function open() {
		is_open(!is_open());
	}

	var $$exports = { open };
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, is_open()));
	$.delegated('click', button, open);
	$.append($$anchor, button);

	return $.pop($$exports);
}

$.delegate(['click']);