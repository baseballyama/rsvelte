import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<p>pending</p>`);
var root_1 = $.from_html(`<button> </button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var node = $.sibling(button, 2);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			Child($$anchor, {
				get count() {
					return $.get(count);
				}
			});
		});
	}

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);