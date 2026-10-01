import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button"> </button> <p> </p>`, 1);

export default function Bindable_proxy($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 27, () => $.proxy([])),
		config = $.prop($$props, 'config', 27, () => $.proxy({ open: false }));

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var p = $.sibling(button, 2);
	var text_1 = $.only_child(p, true);

	$.template_effect(() => {
		$.set_text(text, items().length);
		$.set_text(text_1, config().open);
	});

	$.delegated('click', button, () => items().push(items().length));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);