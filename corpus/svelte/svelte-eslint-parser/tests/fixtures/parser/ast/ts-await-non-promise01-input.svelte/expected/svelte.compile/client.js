import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Ts_await_non_promise01_input($$anchor) {
	const str = 'abc';
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.await(node, () => 1234, null, ($$anchor, number) => {
		var p = root();
		var text = $.only_child(p);

		$.template_effect(() => $.set_text(text, `The number is ${$.get(number) ?? ''}`));
		$.append($$anchor, p);
	});

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => str, null, ($$anchor, s) => {
		var p_1 = root();
		var text_1 = $.only_child(p_1);

		$.template_effect(() => $.set_text(text_1, `The string is ${$.get(s) ?? ''}`));
		$.append($$anchor, p_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(node_2, () => str.slice(0), null, ($$anchor, s) => {
		var p_2 = root();
		var text_2 = $.only_child(p_2);

		$.template_effect(() => $.set_text(text_2, `The string is ${$.get(s) ?? ''}`));
		$.append($$anchor, p_2);
	});

	$.append($$anchor, fragment);
}