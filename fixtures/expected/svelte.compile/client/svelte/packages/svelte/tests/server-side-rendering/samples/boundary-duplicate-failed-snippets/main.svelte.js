import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!> <!></div>`);

export default function Main($$anchor) {
	var div = root();

	{
		const x = 0;
		var node = $.child(div);

		{
			const failed = ($$anchor) => {};

			$.boundary(node, { failed }, ($$anchor) => {});
		}

		var node_1 = $.sibling(node, 2);

		{
			const failed = ($$anchor) => {};

			$.boundary(node_1, { failed }, ($$anchor) => {});
		}

		$.reset(div);
	}

	$.append($$anchor, div);
}