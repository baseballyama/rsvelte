import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>Loading...</p>`);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			Child($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
}