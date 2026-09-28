import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button>reset</button>`, 1);

export default function Counter($$anchor, $$props) {
	$.push($$props, true);

	let object = $.prop($$props, 'object', 15);
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);

	$.template_effect(() => $.set_text(text, `clicks: ${object().count ?? ''}`));
	$.delegated('click', button, () => object(object().count += 1, true));

	$.delegated('click', button_1, function (...$$args) {
		$$props.reset?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);