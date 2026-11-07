import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';

var root = $.from_html(`<div>fades in and out</div>`);
var root_1 = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Input($$anchor) {
	let visible = $.state(false);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.transition(3, div, () => fade);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(visible, !$.get(visible)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);