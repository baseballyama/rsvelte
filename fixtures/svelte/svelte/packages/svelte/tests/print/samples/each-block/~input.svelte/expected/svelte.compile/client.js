import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<li><span> </span><!></li>`);
var root_2 = $.from_html(`<p> </p>`);
var root_3 = $.from_html(`<p>No tasks today!</p>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	$.each(node, 18, () => items, ({ id, name, qty }) => id, ($$anchor, $$item, i) => {
		let id = () => $$item.id;
		let name = () => $$item.name;
		let qty = () => $$item.qty;
		var li = root();
		var text = $.only_child(li);

		$.template_effect(() => $.set_text(text, `${$.get(i) + 1}: ${name() ?? ''} x ${qty() ?? ''}`));
		$.append($$anchor, li);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => objects, $.index, ($$anchor, $$item) => {
		let id = () => $$item.id;
		let rest = () => $.exclude_from_object($$item, ['id']);
		var li_1 = root_1();
		var span = $.child(li_1);
		var text_1 = $.only_child(span, true);
		var node_2 = $.sibling(span);

		MyComponent(node_2, $.spread_props(rest));
		$.reset(li_1);
		$.template_effect(() => $.set_text(text_1, id()));
		$.append($$anchor, li_1);
	});

	var node_3 = $.sibling(node_1, 2);

	$.each(node_3, 16, () => expression, $.index, ($$anchor, $$item) => {
		$.next();

		var text_2 = $.text('...');

		$.append($$anchor, text_2);
	});

	var node_4 = $.sibling(node_3, 2);

	$.each(
		node_4,
		16,
		() => todos,
		$.index,
		($$anchor, todo) => {
			var p = root_2();
			var text_3 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_3, todo.text));
			$.append($$anchor, p);
		},
		($$anchor) => {
			var p_1 = root_3();

			$.append($$anchor, p_1);
		}
	);

	$.append($$anchor, fragment);
}