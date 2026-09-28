import * as $ from 'svelte/internal/server';

import {
	StructuredList,
	StructuredListBody,
	StructuredListCell,
	StructuredListHead,
	StructuredListInput,
	StructuredListRow
} from "carbon-components-svelte";

export default function StructuredListFixture($$renderer) {
	let selected = undefined;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		StructuredList($$renderer, {
			'data-testid': 'structured-list',
			selection: true,
			get selected() {
				return selected;
			},

			set selected($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				StructuredListHead($$renderer, {
					children: ($$renderer) => {
						StructuredListRow($$renderer, {
							head: true,
							children: ($$renderer) => {
								StructuredListCell($$renderer, {
									head: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Name`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								StructuredListCell($$renderer, {
									head: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Value`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								StructuredListCell($$renderer, {
									head: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->`);
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

				StructuredListBody($$renderer, {
					children: ($$renderer) => {
						StructuredListRow($$renderer, {
							label: true,
							for: 'row-a',
							children: ($$renderer) => {
								StructuredListCell($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Row A`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								StructuredListCell($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Value A`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								StructuredListInput($$renderer, { id: 'row-a', value: 'a', title: 'Select row A' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						StructuredListRow($$renderer, {
							label: true,
							for: 'row-b',
							children: ($$renderer) => {
								StructuredListCell($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Row B`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								StructuredListCell($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Value B`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								StructuredListInput($$renderer, { id: 'row-b', value: 'b', title: 'Select row B' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div data-testid="selected-value">${$.escape(selected ?? "none")}</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}