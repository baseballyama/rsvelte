import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>loading...</p>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => thePromise,
		($$anchor) => {
			var p_2 = root_1();

			$.append($$anchor, p_2);
		},
		($$anchor, theValue) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `the value is ${$.get(theValue) ?? ''}`));
			$.append($$anchor, p);
		},
		($$anchor, theError) => {
			var p_1 = root();
			var text_1 = $.only_child(p_1);

			$.template_effect(() => $.set_text(text_1, `oh no! ${$.get(theError).message ?? ''}`));
			$.append($$anchor, p_1);
		}
	);

	$.append($$anchor, fragment);
}