import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<!> <button>a</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let p = $.state('b');

	$.user_pre_effect(() => {
		console.log('pre');

		if ($.get(p) === 'a') $.set(p, null);
	});

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Component($$anchor, {
						get p() {
							return $.get(p);
						}
					});
				};

				$.if(node_1, ($$render) => {
					if ($.get(p)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(p) || !$.get(p)) $$render(consequent_1);
		});
	}

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => $.set(p, 'a'));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);