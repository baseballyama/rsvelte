import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';

var root = $.from_html(`<button>Hide</button>`);
var root_1 = $.from_html(`<h1>Outside</h1> <!>`, 1);

export default function Component($$anchor) {
	let show = $.state(true);
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	{
		var consequent = ($$anchor) => {
			var button = root();

			$.delegated('click', button, () => $.set(show, false));
			$.transition(7, button, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}

$.delegate(['click']);