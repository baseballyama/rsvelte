import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip, { Wrapper } from '@smui/tooltip';
import Button from '@smui/button';
import { Label } from '@smui/common';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <div><!></div>`, 1);

export default function _Disappearing($$anchor) {
	let show = $.state(true);
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			Wrapper(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					Button(node_2, {
						touch: true,
						onclick: () => $.set(show, false),
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Click Me to Disappear My Container');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Tooltip(node_3, {
						children: ($$anchor, $$slotProps) => {
							Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('I am a tooltip in a container that disappears.');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var node_4 = $.child(div_1);

	Button(node_4, {
		touch: true,
		onclick: () => $.set(show, true),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Click Me to Reset');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}