import * as $ from 'svelte/internal/server';
import Tab, { Icon, Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

export default function _KeyedIconsAboveRestrictedIndicatorsFadeTransition($$renderer) {
	let tabs = [
		{ k: 1, icon: 'code', label: 'Code' },
		{ k: 2, icon: 'code', label: 'Code' },
		{ k: 3, icon: 'code', label: 'Code' },
		{ k: 4, icon: 'code', label: 'Code' }
	];

	let active = tabs[2];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		{
			function tab($$renderer, tab) {
				Tab($$renderer, {
					tab,
					stacked: true,
					indicatorSpanOnlyContent: true,
					tabIndicator$transition: 'fade',
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
				key: (tab) => tab.k,
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

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(active.k)}</pre></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}