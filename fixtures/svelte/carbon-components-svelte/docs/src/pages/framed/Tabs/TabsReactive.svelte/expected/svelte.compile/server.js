import * as $ from 'svelte/internal/server';
import { Button, Stack, Tab, TabContent, Tabs } from "carbon-components-svelte";

export default function TabsReactive($$renderer) {
	let selected = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				Tabs($$renderer, {
					get selected() {
						return selected;
					},

					set selected($$value) {
						selected = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Tab($$renderer, { label: 'Tab label 1' });
						$$renderer.push(`<!----> `);
						Tab($$renderer, { label: 'Tab label 2' });
						$$renderer.push(`<!----> `);
						Tab($$renderer, { label: 'Tab label 3' });
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

				$$renderer.push(`<!----> `);

				Stack($$renderer, {
					gap: 4,
					orientation: 'horizontal',
					align: 'center',
					children: ($$renderer) => {
						$$renderer.push(`<div>`);

						Button($$renderer, {
							kind: 'tertiary',
							size: 'small',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Set index to 1`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div><strong>Selected index:</strong> ${$.escape(selected)}</div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}