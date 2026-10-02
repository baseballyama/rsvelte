import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);
var root_1 = $.from_html(`<h1>Promise Pending</h1>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => somePromise,
		($$anchor) => {
			var h1_2 = root_1();

			$.append($$anchor, h1_2);
		},
		($$anchor, value) => {
			var h1 = root();
			var text = $.only_child(h1);

			$.template_effect(() => $.set_text(text, `Promise Resolved ${$.get(value) ?? ''}`));
			$.append($$anchor, h1);
		},
		($$anchor, error) => {
			var h1_1 = root();
			var text_1 = $.only_child(h1_1);

			$.template_effect(() => $.set_text(text_1, `Promise Errored ${$.get(error) ?? ''}`));
			$.append($$anchor, h1_1);
		}
	);

	var node_1 = $.sibling(node, 2);

	$.await(
		node_1,
		() => somePromise,
		($$anchor) => {
			var h1_5 = root_1();

			$.append($$anchor, h1_5);
		},
		($$anchor, value) => {
			var h1_3 = root();
			var text_2 = $.only_child(h1_3);

			$.template_effect(() => $.set_text(text_2, `Promise Resolved ${$.get(value) ?? ''}`));
			$.append($$anchor, h1_3);
		},
		($$anchor, error) => {
			var h1_4 = root();
			var text_3 = $.only_child(h1_4);

			$.template_effect(() => $.set_text(text_3, `Promise Errored ${$.get(error) ?? ''}`));
			$.append($$anchor, h1_4);
		}
	);

	$.append($$anchor, fragment);
}