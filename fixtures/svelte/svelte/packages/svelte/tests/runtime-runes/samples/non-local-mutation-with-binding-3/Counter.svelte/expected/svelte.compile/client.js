import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button> </button>`, 1);

export default function Counter($$anchor, $$props) {
	$.push($$props, true);

	/** @type {{ shared: { count: number }, notshared: { count: number } }} */
	let shared = $.prop($$props, 'shared', 15),
		notshared = $.prop($$props, 'notshared', 7);

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1);

	$.template_effect(() => {
		$.set_text(text, `clicks: ${shared().count ?? ''}`);
		$.set_text(text_1, `clicks: ${notshared().count ?? ''}`);
	});

	$.delegated('click', button, () => shared(shared().count += 1, true));
	$.delegated('click', button_1, () => notshared().count += 1);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);