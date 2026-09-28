import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>Error occurred</p>`);
var root_1 = $.from_html(`<button>change</button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		const failed = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { failed }, ($$anchor) => {
			Child($$anchor, {
				get count() {
					return $.get(count);
				}
			});
		});
	}

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);