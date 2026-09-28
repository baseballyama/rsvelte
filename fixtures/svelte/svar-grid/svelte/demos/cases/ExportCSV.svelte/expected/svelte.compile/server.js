import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { Button } from "@svar-ui/svelte-core";
import { getData } from "../data";

export default function ExportCSV($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { clientData, clientColumns, treeData, treeFixedColumns } = getData();
		let api1 = void 0;
		let api2 = void 0;

		function exportCsv(api) {
			api.exec("export-data", { format: "csv", fileName: "clients", csv: { cols: ";" } });
		}

		$$renderer.push(`<div style="padding: 20px;"><p>`);

		Button($$renderer, {
			type: 'primary',
			onclick: () => exportCsv(api1),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Export to CSV`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p> <div style="max-width: 800px;">`);
		Grid($$renderer, { footer: true, data: clientData, columns: clientColumns });
		$$renderer.push(`<!----></div></div> <div style="padding: 20px;"><p>`);

		Button($$renderer, {
			type: 'primary',
			onclick: () => exportCsv(api2),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Export to CSV`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p> <div style="max-width: 800px;">`);

		Grid($$renderer, {
			tree: true,
			data: treeData,
			columns: treeFixedColumns,
			footer: true
		});

		$$renderer.push(`<!----></div></div>`);
	});
}