import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";

var root = $.from_html(`<div class="error">An error occurred!</div>`);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const failed = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			Child($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
}