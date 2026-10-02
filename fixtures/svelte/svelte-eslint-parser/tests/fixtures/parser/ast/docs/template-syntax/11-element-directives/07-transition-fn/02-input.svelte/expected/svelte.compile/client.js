import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>fades in and out</div>`);

export default function _2_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.transition(3, div, () => fade);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}