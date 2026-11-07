import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Main($$anchor) {
	let show = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 16, () => ({ length: 1234 }), $.index, ($$anchor, i) => {
				Child($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, i));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
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