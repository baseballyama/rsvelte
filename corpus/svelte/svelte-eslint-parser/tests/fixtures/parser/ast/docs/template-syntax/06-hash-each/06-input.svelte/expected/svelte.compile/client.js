import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>No tasks today!</p>`);

export default function _6_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(
		node,
		16,
		() => todos,
		$.index,
		($$anchor, todo) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, todo.text));
			$.append($$anchor, p);
		},
		($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		}
	);

	$.append($$anchor, fragment);
}