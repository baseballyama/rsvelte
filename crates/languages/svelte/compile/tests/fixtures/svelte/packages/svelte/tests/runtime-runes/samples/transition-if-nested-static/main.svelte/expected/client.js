import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from 'svelte/transition';

var root = $.from_html(`<div>Should not transition out</div>`);
var root_1 = $.from_html(`<button>Toggle</button> <!>`, 1);

export default function Main($$anchor) {
	let showText = $.state(false);
	let show = true;
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var div = root();

					$.transition(3, div, () => slide);
					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if (show) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(showText)) $$render(consequent_1);
		});
	}

	$.delegated('click', button, () => $.set(showText, !$.get(showText)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);