import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button> </button>`, 1);

export default function Sub($$anchor, $$props) {
	$.push($$props, true);

	let count = $.prop($$props, 'count', 15);
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1);

	$.template_effect(() => {
		$.set_text(text, `${count().a ?? ''} (ok)`);
		$.set_text(text_1, `${count().a ?? ''} (bad)`);
	});

	$.delegated('click', button, function (...$$args) {
		$$props.inc?.apply(this, $$args);
	});

	$.delegated('click', button_1, () => count(count().a++, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);