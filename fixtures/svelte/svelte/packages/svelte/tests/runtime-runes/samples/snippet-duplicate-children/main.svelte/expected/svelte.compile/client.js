import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor) => {
			$.next();

			var text = $.text('Hello');

			$.append($$anchor, text);
		};

		Child(node, { children, $$slots: { default: true } });
	}

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor) => {
			$.next();

			var text_1 = $.text('World');

			$.append($$anchor, text_1);
		};

		Child(node_1, { children, $$slots: { default: true } });
	}

	$.append($$anchor, fragment);
}