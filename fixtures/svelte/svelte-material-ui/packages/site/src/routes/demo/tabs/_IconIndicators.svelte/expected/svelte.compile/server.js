import * as $ from 'svelte/internal/server';
import Tab, { Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

export default function _IconIndicators($$renderer) {
	let active = 'Home';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="icon-indicators svelte-1k7u355">`);

		{
			function tab($$renderer, tab) {
				{
					function tabIndicator($$renderer) {
						$$renderer.push(`<!---->star`);
					}

					Tab($$renderer, {
						tab,
						tabIndicator$type: 'icon',
						tabIndicator$content$class: 'material-icons',
						tabIndicator,
						children: ($$renderer) => {
							Label($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(tab)}`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { tabIndicator: true, default: true }
					});
				}
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