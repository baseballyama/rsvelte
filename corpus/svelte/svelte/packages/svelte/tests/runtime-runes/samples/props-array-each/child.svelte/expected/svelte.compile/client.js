import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Child($$anchor, $$props) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $$props.array, $.index, ($$anchor, number) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(number).v));
		$.append($$anchor, p);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => $$props.array, (number) => number, ($$anchor, number) => {
		var p_1 = root();
		var text_1 = $.only_child(p_1, true);

		$.template_effect(() => $.set_text(text_1, number.v));
		$.append($$anchor, p_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => $$props.array, (number) => number.v, ($$anchor, number) => {
		var p_2 = root();
		var text_2 = $.only_child(p_2, true);

		$.template_effect(() => $.set_text(text_2, $.get(number).v));
		$.append($$anchor, p_2);
	});

	$.append($$anchor, fragment);
}