import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from "svelte";

var root = $.from_html(`<p>one</p>`);
var root_1 = $.from_html(`<button>fork</button> <button>update</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let state = $.state(0);
	let count = $.derived(() => $.get(state));
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(count) === 1) $$render(consequent);
		});
	}

	$.delegated('click', button, () => {
		fork(() => {
			$.update(state);
		});
	});

	$.delegated('click', button_1, () => {
		$.update(state);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);