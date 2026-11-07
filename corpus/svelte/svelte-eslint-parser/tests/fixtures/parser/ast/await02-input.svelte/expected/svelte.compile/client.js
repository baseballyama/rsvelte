import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>oh no! Something broke!</p>`);
var root_1 = $.from_html(`<p>the promise is resolved</p>`);
var root_2 = $.from_html(`<p> </p>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Await02_input($$anchor, $$props) {
	$.push($$props, true);

	let expression = new Promise();
	var fragment = root_3();
	var node = $.first_child(fragment);

	$.await(node, () => expression, null, void 0, ($$anchor) => {
		var p = root();

		$.append($$anchor, p);
	});

	var node_1 = $.sibling(node, 2);

	$.await(
		node_1,
		() => expression,
		null,
		($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		},
		($$anchor, theError) => {
			var p_2 = root_2();
			var text = $.only_child(p_2);

			$.template_effect(() => $.set_text(text, `oh no! ${$.get(theError).message ?? ''}`));
			$.append($$anchor, p_2);
		}
	);

	var node_2 = $.sibling(node_1, 2);

	$.await(node_2, () => expression, null, ($$anchor) => {
		var p_3 = root_1();

		$.append($$anchor, p_3);
	});

	$.append($$anchor, fragment);
	$.pop();
}