import * as $ from 'svelte/internal/server';
import Tab from "carbon-components-svelte/Tabs/Tab.svelte";
import TabContent from "carbon-components-svelte/Tabs/TabContent.svelte";
import Tabs from "carbon-components-svelte/Tabs/Tabs.svelte";

export default function TabSecondaryLabel_test($$renderer) {
	Tabs($$renderer, {
		type: 'container',
		children: ($$renderer) => {
			Tab($$renderer, { label: 'Engage', secondaryLabel: '(21/25)' });
			$$renderer.push(`<!----> `);

			Tab($$renderer, {
				label: 'Analyze',
				$$slots: {
					secondaryChildren: ($$renderer) => {
						{
							$$renderer.push(`(12/16)`);
						}
					}
				}
			});

			$$renderer.push(`<!----> `);
			Tab($$renderer, { label: 'Plain' });
			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			content: ($$renderer) => {
				{
					TabContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Engage content`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Analyze content`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Plain content`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}
			}
		}
	});
}