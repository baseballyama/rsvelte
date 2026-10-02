import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello world!</h1> <button> </button>`, 1);

export default function _page($$anchor) {
	let toggle = $.state(false);
	var fragment = root();
	var button = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `Toggle: ${$.get(toggle) ?? ''}`));
	$.delegated('click', button, () => $.set(toggle, !$.get(toggle)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);