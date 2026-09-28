import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';

var root = $.from_html(`<p>loading</p>`);
var root_1 = $.from_html(`<div class="red">red</div>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<button>hide</button> <button>fetch</button> <!>`, 1);

export default function Main($$anchor) {
	let fetching = $.state(false);
	let shown = $.state(true);
	var fragment = root_3();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var div = root_2();
			var node_1 = $.child(div);

			{
				var consequent_1 = ($$anchor) => {
					var div_1 = root_1();

					$.transition(7, div_1, () => fade, () => ({ duration: 100 }));
					$.append($$anchor, div_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(shown)) $$render(consequent_1);
				});
			}

			$.reset(div);
			$.transition(3, div, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(fetching)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.delegated('click', button, () => $.set(shown, false));
	$.delegated('click', button_1, () => $.set(fetching, !$.get(fetching)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);