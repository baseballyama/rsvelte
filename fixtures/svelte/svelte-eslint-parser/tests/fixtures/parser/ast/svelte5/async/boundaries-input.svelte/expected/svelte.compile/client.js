import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyApp from './MyApp.svelte';

var root = $.from_html(`<p>loading...</p>`);

export default function Boundaries_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			MyApp($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
}