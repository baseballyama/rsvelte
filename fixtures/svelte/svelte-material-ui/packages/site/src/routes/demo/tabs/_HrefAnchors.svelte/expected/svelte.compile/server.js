import * as $ from 'svelte/internal/server';
import Tab, { Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

export default function _HrefAnchors($$renderer) {
	let active = 'Home';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function tab($$renderer, tab) {
				Tab($$renderer, {
					tab,
					href: `https://en.wikipedia.org/wiki/${$.stringify(tab.replace(/ /g, '_'))}`,
					target: 'href-tabs-frame',
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

		$$renderer.push(`<!----> <iframe src="https://en.wikipedia.org/wiki/Home" title="Selected Tab" name="href-tabs-frame" style="width: 100%; height: 400px; border: 0;" role="tabpanel"></iframe></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}