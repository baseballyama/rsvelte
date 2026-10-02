import * as $ from 'svelte/internal/server';
import { Tab, TabContent, Tabs } from "carbon-components-svelte";
import Calendar from "carbon-icons-svelte/lib/Calendar.svelte";

export default function TabsFixture($$renderer) {
	let selected = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Tabs($$renderer, {
			'data-testid': 'tabs',
			get selected() {
				return selected;
			},

			set selected($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Tab($$renderer, { label: 'Tab 1', icon: Calendar });
				$$renderer.push(`<!----> `);
				Tab($$renderer, { label: 'Tab 2' });
				$$renderer.push(`<!----> `);
				Tab($$renderer, { label: 'Tab 3' });
				$$renderer.push(`<!---->`);
			},

			$$slots: {
				default: true,
				content: ($$renderer) => {
					{
						TabContent($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<p data-testid="tab-content-1">Content for tab 1</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TabContent($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<p data-testid="tab-content-2">Content for tab 2</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TabContent($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<p data-testid="tab-content-3">Content for tab 3</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					}
				}
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}