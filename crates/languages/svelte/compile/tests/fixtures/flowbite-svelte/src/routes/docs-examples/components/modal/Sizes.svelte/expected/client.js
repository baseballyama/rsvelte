import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="block space-y-4 md:space-y-0 md:space-x-4 rtl:space-x-reverse"><!> <!> <!> <!> <!></div> <!>`, 1);

export default function Sizes($$anchor) {
	let openModal = $.state(false);
	let size = $.state("md" // Set default value
	);

	function onclick(modalSize) {
		$.set(size, modalSize, true);
		$.set(openModal, true);
	}

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => onclick("xs"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('xs');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: () => onclick("sm"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('sm');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => onclick("md"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('md');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		onclick: () => onclick("lg"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('lg');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		onclick: () => onclick("xl"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('xl');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_5 = $.sibling(div, 2);

	{
		const footer = ($$anchor) => {
			var fragment_1 = root();
			var node_6 = $.first_child(fragment_1);

			Button(node_6, {
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('I accept');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				type: 'submit',
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Decline');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		Modal(node_5, {
			form: true,
			title: 'Terms of Service',
			get size() {
				return $.get(size);
			},

			get open() {
				return $.get(openModal);
			},

			set open($$value) {
				$.set(openModal, $$value, true);
			},
			footer,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_8 = $.first_child(fragment_2);

				P(node_8, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				P(node_9, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text('The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to\n    notify users as soon as possible of high-risk data breaches that could personally affect them.');

						$.append($$anchor, text_8);
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