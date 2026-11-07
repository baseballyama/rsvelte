import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Main($$anchor) {
	let open = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Child($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($.get(open)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(open, !$.get(open)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);