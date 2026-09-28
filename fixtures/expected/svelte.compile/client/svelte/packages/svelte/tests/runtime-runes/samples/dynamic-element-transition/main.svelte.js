import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';

var root = $.from_html(`<button>Toggle</button> <!>`, 1);

export default function Main($$anchor) {
	let element = 'div';
	let show = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.element(node_1, () => element, false, ($$element, $$anchor) => {
				$.transition(3, $$element, () => fade, () => ({ duration: 100 }));

				var text = $.text('DIV');

				$.append($$anchor, text);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(show, !$.get(show)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);