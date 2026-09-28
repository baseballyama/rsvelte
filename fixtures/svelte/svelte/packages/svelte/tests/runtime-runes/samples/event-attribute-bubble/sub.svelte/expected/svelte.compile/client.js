import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button> </button>`, 1);

export default function Sub($$anchor, $$props) {
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1, true);

	$.template_effect(() => {
		$.set_text(text, $$props.count);
		$.set_text(text_1, $$props.count);
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.delegated('click', button_1, function (...$$args) {
		$$props.increment?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);