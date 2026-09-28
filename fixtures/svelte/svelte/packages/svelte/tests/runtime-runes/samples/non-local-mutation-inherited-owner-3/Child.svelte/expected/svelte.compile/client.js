import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div> <button>Then click here</button>`, 1);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let item = $.prop($$props, 'item', 7);

	function onclick() {
		item().name = `${item().name} edited`;
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);
	var button = $.sibling(div, 2);

	$.template_effect(() => $.set_text(text, item()?.name));
	$.delegated('click', button, onclick);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);