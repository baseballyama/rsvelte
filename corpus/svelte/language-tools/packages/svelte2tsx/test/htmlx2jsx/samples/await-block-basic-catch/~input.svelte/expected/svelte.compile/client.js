import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Promise Resolved</h1>`);
var root_1 = $.from_html(`<h2>Promise Errored</h2>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => somePromise,
		null,
		($$anchor, value) => {
			var h1 = root();

			$.append($$anchor, h1);
		},
		($$anchor) => {
			var h2 = root_1();

			$.append($$anchor, h2);
		}
	);

	$.append($$anchor, fragment);
}