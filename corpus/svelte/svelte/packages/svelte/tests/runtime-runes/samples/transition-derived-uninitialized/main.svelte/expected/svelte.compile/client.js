import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button>fly in</button> <button>fly out</button> <!>`, 1);

export default function Main($$anchor) {
	let show = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			Child($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(show, true));
	$.delegated('click', button_1, () => $.set(show, false));
	$.append($$anchor, fragment);
}

$.delegate(['click']);