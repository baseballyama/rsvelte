import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>no animals</p>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(
		node,
		16,
		() => animals,
		$.index,
		($$anchor, animal) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, animal));
			$.append($$anchor, p);
		},
		($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		}
	);

	$.append($$anchor, fragment);
}