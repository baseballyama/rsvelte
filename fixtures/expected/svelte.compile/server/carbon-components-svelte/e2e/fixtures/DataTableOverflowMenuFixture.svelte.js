import * as $ from 'svelte/internal/server';
import { DataTable, OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";
import { tick } from "svelte";

export default function DataTableOverflowMenuFixture($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ROW_COUNT = 50;

		const headers = [
			{ key: "name", value: "Name" },
			{ key: "overflow", empty: true, width: "72px" }
		];

		const rows = Array.from({ length: ROW_COUNT }, (_, i) => ({ id: `row-${i}`, name: `Row ${i}` }));

		/** @type {boolean[]} */
		let openStates = rows.map(() => false);

		async function setAllOpen(open) {
			for (let i = 0; i < ROW_COUNT; i++) openStates[i] = open;

			openStates = openStates;
			await tick();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="controls svelte-be61tk"><button type="button" data-testid="open-all-menus">Open all menus</button> <button type="button" data-testid="close-all-menus">Close all menus</button></div> <div data-testid="data-table-overflow">`);

			DataTable($$renderer, {
				headers,
				rows,
				$$slots: {
					cell: ($$renderer, { cell, rowIndex }) => {
						{
							if (cell.key === "overflow") {
								$$renderer.push('<!--[0-->');

								OverflowMenu($$renderer, {
									portalMenu: true,
									flipped: true,
									get open() {
										return openStates[rowIndex];
									},

									set open($$value) {
										openStates[rowIndex] = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										OverflowMenuItem($$renderer, { text: 'Edit' });
										$$renderer.push(`<!----> `);
										OverflowMenuItem($$renderer, { text: 'Delete', danger: true });
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(cell.value)}`);
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}