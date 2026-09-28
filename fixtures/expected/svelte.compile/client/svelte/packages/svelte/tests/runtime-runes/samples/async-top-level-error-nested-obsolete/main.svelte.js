import 'svelte/internal/disclose-version';
import Child from './Child.svelte';
import * as $ from 'svelte/internal/client';

export let route = $.proxy({ current: 'home' });

var root = $.from_html(`<p>pending</p>`);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<button>reject</button> <!>`, 1);

export default function Main($$anchor) {
	// reset from earlier tests
	route.current = 'home';

	var fragment = root_2();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Child($$anchor, {});
				};

				var alternate = ($$anchor) => {
					var p_1 = root_1();
					var text = $.only_child(p_1);

					$.template_effect(() => $.set_text(text, `route: ${route.current ?? ''}`));
					$.append($$anchor, p_1);
				};

				$.if(node_1, ($$render) => {
					if (route.current === 'home') $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		});
	}

	$.delegated('click', button, () => route.reject());
	$.append($$anchor, fragment);
}

$.delegate(['click']);