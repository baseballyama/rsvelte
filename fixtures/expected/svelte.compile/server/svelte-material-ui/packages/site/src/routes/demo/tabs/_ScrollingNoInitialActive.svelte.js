import * as $ from 'svelte/internal/server';
import Tab, { Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

export default function _ScrollingNoInitialActive($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div>`);

		{
			function tab($$renderer, tab) {
				Tab($$renderer, {
					tab,
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tab ${$.escape(tab)}`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			TabBar($$renderer, {
				tabs: [...Array(20)].map((_v, i) => i + 1),
				tab,
				$$slots: { tab: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	});
}