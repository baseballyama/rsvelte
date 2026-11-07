import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<div>An error occurred!</div> <!>`, 1);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor, err = $.noop, reset = $.noop) => {
			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1), 2);

			Child(node_1, {});
			$.append($$anchor, fragment_1);
		};

		$.boundary(node, { onerror: (e) => console.log('error caught'), failed }, ($$anchor) => {
			Child($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
}