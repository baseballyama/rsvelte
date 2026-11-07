import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Spinner...</div>`);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.await(node, () => aPromise, ($$anchor) => {
		var div = root();

		$.append($$anchor, div);
	});

	var node_1 = $.sibling(node, 2);

	$.await(
		node_1,
		() => aPromise,
		($$anchor) => {
			var div_2 = root();

			$.append($$anchor, div_2);
		},
		void 0,
		($$anchor, error) => {
			var div_1 = root_1();
			var text = $.only_child(div_1);

			$.template_effect(() => $.set_text(text, `Ups: ${$.get(error) ?? ''}`));
			$.append($$anchor, div_1);
		}
	);

	$.append($$anchor, fragment);
}