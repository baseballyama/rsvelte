import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>Loading</p>`);

export default function Input($$anchor) {
	let promise;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => promise,
		($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		},
		($$anchor, data) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `Data: ${$.get(data) ?? ''}`));
			$.append($$anchor, p);
		}
	);

	$.append($$anchor, fragment);
}