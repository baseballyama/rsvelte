import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Input, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form method="dialog" name="my_form" novalidate=""><fieldset class="flex gap-4 border p-4"><legend class="px-2">Custom form</legend> <!> <!></fieldset></form> <!>`, 1);

export default function NoForm($$anchor) {
	let open = $.state(false);
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('No form modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		const footer = ($$anchor) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Button(node_2, {
				type: 'submit',
				value: 'accept',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Submit button not in form');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				onclick: () => $.set(open, false),
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Button with \'onclick\' handler');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		Modal(node_1, {
			title: 'Custom form',
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},
			footer,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var form = $.first_child(fragment_2);
				var fieldset = $.child(form);
				var node_4 = $.sibling($.child(fieldset), 2);

				Input(node_4, { required: true, placeholder: 'This is separate form' });

				var node_5 = $.sibling(node_4, 2);

				Button(node_5, {
					type: 'submit',
					value: 'accept',
					class: 'shrink-0',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Submit button');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				$.reset(fieldset);
				$.reset(form);

				var node_6 = $.sibling(form, 2);

				P(node_6, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { footer: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}