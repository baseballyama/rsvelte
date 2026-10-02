import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from "svelte/transition";

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<button>hide</button> <!>`, 1);

export default function Main($$anchor) {
	let state = $.state("hello");
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(state)));
					$.append($$anchor, text);
				};

				$.if(node_1, ($$render) => {
					if (true) $$render(consequent);
				});
			}

			$.reset(div);
			$.transition(1, div, () => fade, () => ({ duration: 2000 }));
			$.transition(2, div, () => fade, () => ({ duration: 2000 }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(state)) $$render(consequent_1);
		});
	}

	$.delegated('click', button, () => $.set(state, ''));
	$.append($$anchor, fragment);
}

$.delegate(['click']);