import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Main($$anchor) {
	const promise = Promise.reject('Test');
	let toggle = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.await(node_1, () => promise, ($$anchor) => {});
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(toggle)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(toggle, !$.get(toggle)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);