import * as $ from 'svelte/internal/server';
import Tab from "carbon-components-svelte/Tabs/Tab.svelte";
import TabContent from "carbon-components-svelte/Tabs/TabContent.svelte";
import Tabs from "carbon-components-svelte/Tabs/Tabs.svelte";

export default function TabsAllDisabled_test($$renderer) {
	Tabs($$renderer, {
		children: ($$renderer) => {
			Tab($$renderer, { label: 'Tab 1', disabled: true });
			$$renderer.push(`<!----> `);
			Tab($$renderer, { label: 'Tab 2', disabled: true });
			$$renderer.push(`<!----> `);
			Tab($$renderer, { label: 'Tab 3', disabled: true });
			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			content: ($$renderer) => {
				{
					TabContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Content 1`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Content 2`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Content 3`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}
			}
		}
	});
}