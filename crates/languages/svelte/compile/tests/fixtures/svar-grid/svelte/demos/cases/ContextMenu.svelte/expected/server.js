import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid, ContextMenu, HeaderMenu } from "../../src/";

export default function ContextMenu_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, flexibleColumns: columns } = getData();
		let grid = void 0;

		$$renderer.push(`<div style="padding: 20px;"><h4>Context menu with default actions</h4> `);

		ContextMenu($$renderer, {
			api: grid,
			children: ($$renderer) => {
				HeaderMenu($$renderer, {
					api: grid,
					children: ($$renderer) => {
						Grid($$renderer, { data, columns, multiselect: true, reorder: true });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}