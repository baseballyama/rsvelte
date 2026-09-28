import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="inline-grid grid-cols-3 grid-rows-3 gap-4"><!> <!> <!> <!> <!> <!> <!> <!> <!></div> <!>`, 1);

export default function Placement($$anchor) {
	let placement = $.state("center");
	let openPlacement = $.state(false);

	const setPlacement = (newPlacement) => {
		$.set(placement, newPlacement, true);
		console.log("placement: ", $.get(placement));
		$.set(openPlacement, !$.get(openPlacement));
	};

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => setPlacement("top-left"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('top-left');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: () => setPlacement("top-center"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('top-center');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => setPlacement("top-right"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('top-right');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		onclick: () => setPlacement("center-left"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('center-left');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		onclick: () => setPlacement("center"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('center');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		onclick: () => setPlacement("center-right"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('center-right');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Button(node_6, {
		onclick: () => setPlacement("bottom-left"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('bottom-left');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Button(node_7, {
		onclick: () => setPlacement("bottom-center"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('bottom-center');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Button(node_8, {
		onclick: () => setPlacement("bottom-right"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('bottom-right');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_9 = $.sibling(div, 2);

	{
		const footer = ($$anchor) => {
			var fragment_1 = root();
			var node_10 = $.first_child(fragment_1);

			Button(node_10, {
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('I accept');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Button(node_11, {
				type: 'submit',
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Decline');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		Modal(node_9, {
			title: 'Terms of Service',
			form: true,
			get placement() {
				return $.get(placement);
			},

			get open() {
				return $.get(openPlacement);
			},

			set open($$value) {
				$.set(openPlacement, $$value, true);
			},
			footer,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_12 = $.first_child(fragment_2);

				P(node_12, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text('With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.');

						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				P(node_13, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_12 = $.text('The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to\n    notify users as soon as possible of high-risk data breaches that could personally affect them.');

						$.append($$anchor, text_12);
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