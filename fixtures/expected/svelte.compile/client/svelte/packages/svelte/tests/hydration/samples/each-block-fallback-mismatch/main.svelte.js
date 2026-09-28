import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>empty</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor, $$props) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.each(
		node,
		17,
		() => $$props.items1,
		$.index,
		($$anchor, item) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $.get(item).name));
			$.append($$anchor, p);
		},
		($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		}
	);

	var node_1 = $.sibling(node, 2);

	$.each(
		node_1,
		17,
		() => $$props.items2,
		$.index,
		($$anchor, item) => {
			var p_2 = root();
			var text_1 = $.only_child(p_2, true);

			$.template_effect(() => $.set_text(text_1, $.get(item).name));
			$.append($$anchor, p_2);
		},
		($$anchor) => {
			var p_3 = root_1();

			$.append($$anchor, p_3);
		}
	);

	$.append($$anchor, fragment);
}