import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<li><span> </span><!></li>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _5_input($$anchor) {
	var fragment = root_2();
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

	$.each(node_3, 16, () => items, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($$item));
		let id = () => $.get($$array)[0];
		let rest = () => $.get($$array).slice(1);
		var li_2 = root_1();
		var span_1 = $.child(li_2);
		var text_2 = $.only_child(span_1, true);
		var node_4 = $.sibling(span_1);

		MyComponent(node_4, {
			get values() {
				return rest();
			}
		});

		$.reset(li_2);
		$.template_effect(() => $.set_text(text_2, id()));
		$.append($$anchor, li_2);
	});

	$.append($$anchor, fragment);
}