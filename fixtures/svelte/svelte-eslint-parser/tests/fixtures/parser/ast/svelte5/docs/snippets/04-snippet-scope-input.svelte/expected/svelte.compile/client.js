import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div> <!>`, 1);

export default function _4_snippet_scope_input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	{
		const x = ($$anchor) => {
			const y = ($$anchor) => {
				$.next();

				var text = $.text('...');

				$.append($$anchor, text);
			};

			y($$anchor);
		};

		var node = $.child(div);

		$.snippet(node, () => y);
		$.reset(div);
	}

	var node_1 = $.sibling(div, 2);

	$.snippet(node_1, () => x);
	$.append($$anchor, fragment);
}