import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scrolling($$anchor) {
	let scrollingModal = $.state(false);
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.set(scrollingModal, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Scrolling modal');

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
			title: 'Terms of Service',
			form: true,
			get open() {
				return $.get(scrollingModal);
			},

			set open($$value) {
				$.set(scrollingModal, $$value, true);
			},
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

				var node_6 = $.sibling(node_5, 2);

				P(node_6, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				P(node_7, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to\n    notify users as soon as possible of high-risk data breaches that could personally affect them.');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

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

				var node_10 = $.sibling(node_9, 2);

				P(node_10, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text('With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.');

						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				P(node_11, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text('The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to\n    notify users as soon as possible of high-risk data breaches that could personally affect them.');

						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

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

				var node_14 = $.sibling(node_13, 2);

				P(node_14, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_13 = $.text('With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.');

						$.append($$anchor, text_13);
					},
					$$slots: { default: true }
				});

				var node_15 = $.sibling(node_14, 2);

				P(node_15, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_14 = $.text('The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to\n    notify users as soon as possible of high-risk data breaches that could personally affect them.');

						$.append($$anchor, text_14);
					},
					$$slots: { default: true }
				});

				var node_16 = $.sibling(node_15, 2);

				P(node_16, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_15 = $.text('With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.');

						$.append($$anchor, text_15);
					},
					$$slots: { default: true }
				});

				var node_17 = $.sibling(node_16, 2);

				P(node_17, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_16 = $.text('The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to\n    notify users as soon as possible of high-risk data breaches that could personally affect them.');

						$.append($$anchor, text_16);
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