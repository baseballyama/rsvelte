import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);
var root_1 = $.from_html(`<h1>Promise Pending</h1>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => somePromise,
		($$anchor) => {
			var h1_1 = root_1();

			$.append($$anchor, h1_1);
		},
		($$anchor, value) => {
			var h1 = root();
			var text = $.only_child(h1);

			$.template_effect(() => $.set_text(text, `Promise Resolved ${$.get(value) ?? ''}`));
			$.append($$anchor, h1);
		}
	);

	$.append($$anchor, fragment);
}