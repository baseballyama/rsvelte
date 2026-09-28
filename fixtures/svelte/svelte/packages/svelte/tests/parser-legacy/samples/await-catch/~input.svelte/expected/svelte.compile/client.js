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
			var p_1 = root_1();

			$.append($$anchor, p_1);
		},
		void 0,
		($$anchor, theError) => {
			var p = root();
			var text = $.only_child(p);

			$.template_effect(() => $.set_text(text, `oh no! ${$.get(theError).message ?? ''}`));
			$.append($$anchor, p);
		}
	);

	$.append($$anchor, fragment);
}