import * as $ from 'svelte/internal/server';
import Tab from "carbon-components-svelte/Tabs/Tab.svelte";
import TabContent from "carbon-components-svelte/Tabs/TabContent.svelte";
import Tabs from "carbon-components-svelte/Tabs/Tabs.svelte";
import Calendar from "../../src/icons/Calendar.svelte";
import Information from "../../src/icons/Information.svelte";
import Settings from "../../src/icons/Settings.svelte";

export default function TabIconSecondaryLabel_test($$renderer) {
	Tabs($$renderer, {
		type: 'container',
		children: ($$renderer) => {
			Tab($$renderer, {
				label: 'Calendar',
				icon: Calendar,
				secondaryLabel: '(12 events)'
			});

			$$renderer.push(`<!----> `);

			Tab($$renderer, {
				label: 'Information',
				icon: Information,
				secondaryLabel: '(3 new)'
			});

			$$renderer.push(`<!----> `);

			Tab($$renderer, {
				label: 'Settings',
				icon: Settings,
				secondaryLabel: '(2 pending)',
				disabled: true
			});

			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			content: ($$renderer) => {
				{
					TabContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Calendar content`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Information content`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TabContent($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Settings content`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}
			}
		}
	});
}