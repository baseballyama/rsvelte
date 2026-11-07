import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button></button>`, 1);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => Array(1), $.index, ($$anchor, $$item) => {
		let ref = $.state(void 0);
		let count = $.state(0);
		var fragment_1 = root();
		var button = $.first_child(fragment_1);
		var text = $.only_child(button, true);

		$.bind_this(button, ($$value) => $.set(ref, $$value), () => $.get(ref));

		var button_1 = $.sibling(button, 2);

		$.template_effect(() => $.set_text(text, $.get(count)));
		$.delegated('click', button, () => $.update(count));
		$.delegated('click', button_1, () => $.get(ref).click());
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);