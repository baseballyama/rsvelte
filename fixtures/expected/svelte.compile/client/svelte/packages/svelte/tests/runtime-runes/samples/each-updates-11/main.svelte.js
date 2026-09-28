import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>add 4</button> <button>add 5</button> <button>modify 3</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let list = $.state($.proxy([
		{ id: 1, text: '1' },
		{ id: 2, text: '2' },
		{ id: 3, text: '3' }
	]));

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var node = $.sibling(button_2, 2);

	$.each(node, 17, () => $.get(list), (item) => item.id, ($$anchor, item) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(item).text));
		$.append($$anchor, text);
	});

	$.delegated('click', button, () => $.set(
		list,
		[
			$.get(list)[0],
			{ id: 4, text: '4' },
			...$.get(list).slice(1)
		],
		true
	));

	$.delegated('click', button_1, () => $.set(
		list,
		[
			$.get(list)[0],
			$.get(list)[1],
			{ id: 5, text: '5' },
			...$.get(list).slice(2)
		],
		true
	));

	$.delegated('click', button_2, () => $.get(list).at(-1).text = 'updated');
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);