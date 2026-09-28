import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tab, { Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';
import Button from '@smui/button';
import Paper, { Content } from '@smui/paper';

var root = $.from_html(`<div><!> <!> <div style="margin-top: 1em;"><div>Programmatically select:</div> <!></div></div>`);

export default function _Simple($$anchor) {
	let active = $.state('Home');
	var div = root();
	var node = $.child(div);

	{
		const tab = ($$anchor, tab = $.noop) => {
			Tab($$anchor, {
				get tab() {
					return tab();
				},

				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, tab()));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		TabBar(node, {
			tabs: ['Home', 'Merchandise', 'About Us'],
			get active() {
				return $.get(active);
			},

			set active($$value) {
				$.set(active, $$value, true);
			},
			tab,
			$$slots: { tab: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Paper($$anchor, {
				role: 'tabpanel',
				variant: 'unelevated',
				children: ($$anchor, $$slotProps) => {
					Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Welcome to the Home page! I hope you like SMUI!');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		var consequent_1 = ($$anchor) => {
			Paper($$anchor, {
				role: 'tabpanel',
				variant: 'unelevated',
				children: ($$anchor, $$slotProps) => {
					Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('You want merch? We got so much cool merch! We got SMUI toilet paper,\n        SMUI ironing boards, SMUI gas pedals! Come and get \'em!');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		var consequent_2 = ($$anchor) => {
			Paper($$anchor, {
				role: 'tabpanel',
				variant: 'unelevated',
				children: ($$anchor, $$slotProps) => {
					Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('We are a boutique UI library, ready to get you up and running on\n        whatever your project is. Whether you\'re building a web UI for an\n        automated toaster or a web UI for an automated coffee maker, SMUI is\n        ready for you!');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(active) === 'Home') $$render(consequent); else if ($.get(active) === 'Merchandise') $$render(consequent_1, 1); else if ($.get(active) === 'About Us') $$render(consequent_2, 2);
		});
	}

	var div_1 = $.sibling(node_1, 2);
	var node_2 = $.sibling($.child(div_1), 2);

	$.each(node_2, 16, () => ['Home', 'Merchandise', 'About Us'], $.index, ($$anchor, tab) => {
		Button($$anchor, {
			onclick: () => $.set(active, tab, true),
			children: ($$anchor, $$slotProps) => {
				Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, tab));
						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}