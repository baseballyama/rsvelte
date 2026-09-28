import * as $ from 'svelte/internal/server';
import Tab, { Icon, Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

export default function _Icons($$renderer) {
	let tabs = [
		{ icon: 'access_time', label: 'Recents' },
		{ icon: 'near_me', label: 'Nearby' },
		{ icon: 'favorite', label: 'Favorites' }
	];

	let active = tabs[0];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function tab($$renderer, tab) {
				Tab($$renderer, {
					tab,
					children: ($$renderer) => {
						Icon($$renderer, {
							class: 'material-icons',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(tab.icon)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(tab.label)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			TabBar($$renderer, {
				tabs,
				key: (tab) => tab.label,
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