import * as $ from 'svelte/internal/server';

import {
	Button,
	ButtonSet,
	Stack,
	Toolbar,
	ToolbarContent,
	ToolbarSearch
} from "carbon-components-svelte";

export default function ToolbarSearchReactive($$renderer) {
	let value = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				Toolbar($$renderer, {
					children: ($$renderer) => {
						ToolbarContent($$renderer, {
							children: ($$renderer) => {
								ToolbarSearch($$renderer, {
									placeholder: 'Search...',
									get value() {
										return value;
									},

									set value($$value) {
										value = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									size: 'small',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Create`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Stack($$renderer, {
					gap: 5,
					children: ($$renderer) => {
						$$renderer.push(`<div>`);

						ButtonSet($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									size: 'small',
									disabled: value === "products",
									children: ($$renderer) => {
										$$renderer.push(`<!---->Set value`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									kind: 'ghost',
									size: 'small',
									disabled: value.length === 0,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Clear value`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div><strong>Search value:</strong> ${$.escape(value)}</div>`);
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