import * as $ from 'svelte/internal/server';
import { Button } from "@svar-ui/svelte-core";
import { getData } from "../data";
import { Grid } from "../../src/";

export default function TreeTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { treeData, treeColumns } = getData();
		let api = void 0;

		function openAll() {
			api.exec("open-row", { id: 0, nested: true });
		}

		function closeAll() {
			api.exec("close-row", { id: 0, nested: true });
		}

		$$renderer.push(`<div style="padding: 20px;"><div class="toolbar svelte-51cyyt">`);

		Button($$renderer, {
			type: 'primary',
			onclick: () => openAll(),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open all`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'primary',
			onclick: () => closeAll(),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Close all`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div>`);

		Grid($$renderer, {
			tree: true,
			data: treeData,
			columns: treeColumns,
			footer: true
		});

		$$renderer.push(`<!----></div></div>`);
	});
}