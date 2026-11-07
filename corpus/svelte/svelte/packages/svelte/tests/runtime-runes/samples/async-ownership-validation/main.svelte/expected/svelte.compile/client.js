import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>loading...</p>`);

export default function Main($$anchor) {
	let object = $.proxy({ count: 0 });
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			Child($$anchor, {
				get object() {
					return object;
				}
			});
		});
	}

	$.append($$anchor, fragment);
}