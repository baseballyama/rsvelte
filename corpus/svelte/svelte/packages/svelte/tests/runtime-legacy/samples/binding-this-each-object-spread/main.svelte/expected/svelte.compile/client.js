import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div> <div> </div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const items1 = {};
	const items2 = {};
	let data = [{ id: 1, text: "a" }, { id: 2, text: "b" }];
	var $$exports = { items1, items2 };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => data, ({ id, text }) => id, ($$anchor, $$item) => {
		let id = () => $.get($$item).id;
		let text = () => $.get($$item).text;
		var fragment_1 = root();
		var div = $.first_child(fragment_1);
		var text_1 = $.only_child(div, true);

		$.bind_this(div, ($$value, id) => items1[id] = $$value, (id) => items1?.[id], () => [id()]);

		var div_1 = $.sibling(div, 2);
		var text_2 = $.only_child(div_1, true);

		$.bind_this(div_1, ($$value, id) => items2[id] = $$value, (id) => items2?.[id], () => [id()]);

		$.template_effect(() => {
			$.set_text(text_1, text());
			$.set_text(text_2, text());
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}