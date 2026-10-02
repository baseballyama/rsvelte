import * as $ from 'svelte/internal/server';
import Tab, { Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';
import Button from '@smui/button';
import Paper, { Content } from '@smui/paper';

export default function _Simple($$renderer) {
	let active = 'Home';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function tab($$renderer, tab) {
				Tab($$renderer, {
					tab,
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(tab)}`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			TabBar($$renderer, {
				tabs: ['Home', 'Merchandise', 'About Us'],
				get active() {
					return active;
				},

				set active($$value) {
					active = $$value;
					$$settled = false;
				},
				tab,
				$$slots: { tab: true }
			});
		}

		$$renderer.push(`<!----> `);

		if (active === 'Home') {
			$$renderer.push('<!--[0-->');

			Paper($$renderer, {
				role: 'tabpanel',
				variant: 'unelevated',
				children: ($$renderer) => {
					Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Welcome to the Home page! I hope you like SMUI!`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		} else if (active === 'Merchandise') {
			$$renderer.push('<!--[1-->');

			Paper($$renderer, {
				role: 'tabpanel',
				variant: 'unelevated',
				children: ($$renderer) => {
					Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->You want merch? We got so much cool merch! We got SMUI toilet paper,
        SMUI ironing boards, SMUI gas pedals! Come and get 'em!`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		} else if (active === 'About Us') {
			$$renderer.push('<!--[2-->');

			Paper($$renderer, {
				role: 'tabpanel',
				variant: 'unelevated',
				children: ($$renderer) => {
					Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->We are a boutique UI library, ready to get you up and running on
        whatever your project is. Whether you're building a web UI for an
        automated toaster or a web UI for an automated coffee maker, SMUI is
        ready for you!`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div style="margin-top: 1em;"><div>Programmatically select:</div> <!--[-->`);

		const each_array = $.ensure_array_like(['Home', 'Merchandise', 'About Us']);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let tab = each_array[$$index];

			Button($$renderer, {
				onclick: () => active = tab,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(tab)}`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}