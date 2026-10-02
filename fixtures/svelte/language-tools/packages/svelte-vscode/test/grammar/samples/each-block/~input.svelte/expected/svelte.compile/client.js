import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.each(
		node,
		16,
		() => items,
		$.index,
		($$anchor, item) => {
			var div = root();
			var text = $.only_child(div, true);

			$.template_effect(() => $.set_text(text, item));
			$.append($$anchor, div);
		},
		($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		}
	);

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => showGroups, ([key, items]) => key, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($$item, 2));
		let key = () => $.get($$array)[0];
		let items = () => $.get($$array)[1];
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 16, () => v, $.index, ($$anchor, $$item) => {
		$.next();

		var text_1 = $.text('this should be seen as text');

		$.append($$anchor, text_1);
	});

	var node_3 = $.sibling(node_2, 2);

	$.each(node_3, 16, () => v, $.index, ($$anchor, $$item) => {
		$.next();

		var text_2 = $.text('this should be seen as text');

		$.append($$anchor, text_2);
	});

	var node_4 = $.sibling(node_3, 2);

	$.each(node_4, 16, () => v, $.index, ($$anchor, $$item) => {
		$.next();

		var text_3 = $.text('this should be seen as text');

		$.append($$anchor, text_3);
	});

	var node_5 = $.sibling(node_4, 2);

	$.each(node_5, 16, () => v, $.index, ($$anchor, $$item) => {
		$.next();

		var text_4 = $.text('this should be seen as text');

		$.append($$anchor, text_4);
	});

	$.append($$anchor, fragment);
}