import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>waiting for the promise to resolve...</p>`);

export default function _2_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => promise,
		($$anchor) => {
			var p_2 = root_1();

			$.append($$anchor, p_2);
		},
		($$anchor, value) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `The value is ${$.get(value) ?? ''}`));
			$.append($$anchor, p);
		},
		($$anchor, error) => {
			var p_1 = root();
			var text_1 = $.only_child(p_1);

			$.template_effect(() => $.set_text(text_1, `Something went wrong: ${$.get(error).message ?? ''}`));
			$.append($$anchor, p_1);
		}
	);

	$.append($$anchor, fragment);
}