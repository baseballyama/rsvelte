import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const pending = ($$anchor) => {
			$.next();

			var text = $.text('...');

			$.append($$anchor, text);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			Child($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
}