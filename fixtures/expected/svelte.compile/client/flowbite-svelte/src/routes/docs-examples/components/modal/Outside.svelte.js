import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, P } from "flowbite-svelte";

var root = $.from_html(`<h3>Terms of Service <small class="font-normal">(Revised)</small></h3>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Outside($$anchor) {
	let open = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		const header = ($$anchor) => {
			var h3 = root();

			$.append($$anchor, h3);
		};

		const footer = ($$anchor) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Button(node_2, {
				type: 'submit',
				value: 'accept',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('I accept');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				type: 'submit',
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Decline');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		Modal(node_1, {
			form: true,
			outsideclose: false,
			class: 'backdrop:bg-red-900/50 dark:backdrop:bg-green-300/50',
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},
			header,
			footer,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_4 = $.first_child(fragment_2);

				P(node_4, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				P(node_5, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to\n    notify users as soon as possible of high-risk data breaches that could personally affect them.');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { header: true, footer: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}