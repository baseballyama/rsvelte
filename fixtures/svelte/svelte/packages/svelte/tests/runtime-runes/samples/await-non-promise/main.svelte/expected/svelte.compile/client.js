import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>number</button> <button>nullify</button> <p><!></p>`, 1);

export default function Main($$anchor) {
	let count = $.state(void 0);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var p = $.sibling(button_1, 2);
	var node = $.child(p);

	$.await(
		node,
		() => $.get(count),
		($$anchor) => {
			var text_1 = $.text('loading');

			$.append($$anchor, text_1);
		},
		($$anchor, count) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(count)));
			$.append($$anchor, text);
		}
	);

	$.reset(p);
	$.delegated('click', button, () => $.set(count, 1));
	$.delegated('click', button_1, () => $.set(count, null));
	$.append($$anchor, fragment);
}

$.delegate(['click']);