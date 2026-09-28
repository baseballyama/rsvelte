import * as $ from 'svelte/internal/server';
import Tab, { Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

export default function _MinWidth($$renderer) {
	let active = 'Home';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function tab($$renderer, tab) {
				Tab($$renderer, {
					tab,
					minWidth: true,
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

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}