import * as $ from 'svelte/internal/server';
import { Button } from "@svar-ui/svelte-core";
import { repeatColumns, repeatData } from "../data";
import { Grid } from "../../src/";

export default function MultilineRows($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function addRow() {
			api.exec("add-row", { row: {} });
		}

		function deleteRow() {
			const id = api.getState().selectedRows[0];

			if (id) {
				api.exec("delete-row", { id });
			}
		}

		let api = void 0;

		$$renderer.push(`<div class="bar svelte-o6efzn">`);

		Button($$renderer, {
			onclick: addRow,
			type: 'primary',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Add row`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: deleteRow,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Delete Row`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo svelte-o6efzn">`);

		Grid($$renderer, {
			autoRowHeight: true,
			data: repeatData(60),
			columns: repeatColumns(15).map((c) => ({ ...c, resize: true, editor: "text" })),
			footer: true,
			split: { left: 2 }
		});

		$$renderer.push(`<!----></div>`);
	});
}