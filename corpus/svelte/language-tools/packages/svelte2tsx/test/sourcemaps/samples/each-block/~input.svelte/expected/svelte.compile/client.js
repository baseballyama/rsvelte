import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<li><span> </span><!></li>`);
var root_2 = $.from_html(`<p> </p>`);
var root_3 = $.from_html(`<p>No tasks today!</p>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, $.index, ($$anchor, item) => {
		var li = root();
		var text = $.only_child(li);

		$.template_effect(() => $.set_text(text, `${item.name ?? ''} x ${item.qty ?? ''}`));
		$.append($$anchor, li);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => items, $.index, ($$anchor, item, i) => {
		var li_1 = root();
		var text_1 = $.only_child(li_1);

		$.template_effect(() => $.set_text(text_1, `${i + 1}: ${item.name ?? ''} x ${item.qty ?? ''}`));
		$.append($$anchor, li_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 18, () => items, ({ id, name, qty }) => id, ($$anchor, $$item, i) => {
		let id = () => $$item.id;
		let name = () => $$item.name;
		let qty = () => $$item.qty;
		var li_2 = root();
		var text_2 = $.only_child(li_2);

		$.template_effect(() => $.set_text(text_2, `${$.get(i) + 1}: ${name() ?? ''} x ${qty() ?? ''}`));
		$.append($$anchor, li_2);
	});

	var node_3 = $.sibling(node_2, 2);

	$.each(node_3, 16, () => objects, $.index, ($$anchor, $$item) => {
		let id = () => $$item.id;
		let rest = () => $.exclude_from_object($$item, ['id']);
		var li_3 = root_1();
		var span = $.child(li_3);
		var text_3 = $.only_child(span, true);
		var node_4 = $.sibling(span);

		MyComponent(node_4, $.spread_props(rest));
		$.reset(li_3);
		$.template_effect(() => $.set_text(text_3, id()));
		$.append($$anchor, li_3);
	});

	var node_5 = $.sibling(node_3, 2);

	$.each(node_5, 16, () => items, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($$item));
		let id = () => $.get($$array)[0];
		let rest = () => $.get($$array).slice(1);
		var li_4 = root_1();
		var span_1 = $.child(li_4);
		var text_4 = $.only_child(span_1, true);
		var node_6 = $.sibling(span_1);

		MyComponent(node_6, {
			get values() {
				return rest();
			}
		});

		$.reset(li_4);
		$.template_effect(() => $.set_text(text_4, id()));
		$.append($$anchor, li_4);
	});

	var node_7 = $.sibling(node_5, 2);

	$.each(
		node_7,
		16,
		() => todos,
		$.index,
		($$anchor, todo) => {
			var p = root_2();
			var text_5 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_5, todo.text));
			$.append($$anchor, p);
		},
		($$anchor) => {
			var p_1 = root_3();

			$.append($$anchor, p_1);
		}
	);

	$.append($$anchor, fragment);
}