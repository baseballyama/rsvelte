import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from 'svelte/transition';

var root = $.from_html(`<p>hello</p>`);
var root_1 = $.from_html(`<button>toggle</button> <div style="display: none"><!></div>`, 1);

export default function Main($$anchor) {
	let visible = $.state(false);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.transition(3, p, () => slide);
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.reset(div);
	$.delegated('click', button, () => $.set(visible, !$.get(visible)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);