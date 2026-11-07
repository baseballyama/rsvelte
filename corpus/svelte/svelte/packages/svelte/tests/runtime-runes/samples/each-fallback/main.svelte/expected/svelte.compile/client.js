import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <button>Toggle</button>`, 1);

export default function Main($$anchor) {
	let data = $.state($.proxy({ a: 1, b: 2, c: 3 }));
	let filter = $.state(false);

	function toggle_filter() {
		if ($.get(filter)) {
			$.set(filter, false);
			$.set(data, { a: 1, b: 2, c: 3 }, true);
		} else {
			$.set(filter, true);
			$.set(data, {}, true);
		}
	}

	var fragment = root();
	var div = $.first_child(fragment);

	$.each(
		div,
		21,
		() => Object.keys($.get(data)),
		$.index,
		($$anchor, key) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(key)));
			$.append($$anchor, text);
		},
		($$anchor) => {
			$.next();

			var text_1 = $.text('Fallback');

			$.append($$anchor, text_1);
		}
	);

	$.reset(div);

	var button = $.sibling(div, 2);

	$.delegated('click', button, toggle_filter);
	$.append($$anchor, fragment);
}

$.delegate(['click']);