import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <button></button>`, 1);

export default function Main($$anchor) {
	let raw_items = $.state([
		{ id: 0, text: 'a' },
		{ id: 1, text: 'b' },
		{ id: 2, text: 'c' }
	]);

	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $.get(raw_items), (item) => item.id, ($$anchor, item) => {
		$.next();

		var text = $.text();

		$.template_effect(
			($0) => $.set_text(text, `${$0 ?? ''}
	${$.get(item).text ?? ''}`),
			[() => console.log($.get(item).text)]
		);

		$.append($$anchor, text);
	});

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => {
		$.set(raw_items, [...$.get(raw_items), { id: 3, text: 'd' }]);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);