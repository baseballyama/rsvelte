import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { Grid } from "../../src";
import { Button } from "@svar-ui/svelte-core";
import { getData } from "../data";

export default function TableAPI($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { allData } = getData();
		let data = allData.slice(0, 10);
		const otherData = allData.slice(0, 5);

		const columns = [
			{ id: "id", header: { rowspan: 2 }, width: 50 },
			{
				id: "city",
				width: 100,
				header: { text: "City", rowspan: 2 },
				footer: "City",
				sort: true
			},

			{
				id: "firstName",
				header: [{ text: "First Name" }, { filter: "text" }],
				footer: "First Name",
				editor: "text",
				width: 150,
				sort: true
			},

			{
				id: "lastName",
				header: [{ text: "Last Name" }, { filter: "text" }],
				footer: "Last Name",
				editor: "text",
				width: 150,
				sort: true
			},

			{
				id: "email",
				header: { text: "Email", rowspan: 2 },
				footer: "Email",
				sort: true
			}
		];

		const helpers = getContext("wx-helpers");
		let tbl = void 0;
		let selected = void 0;

		function init(tbl) {
			const rState = tbl.getReactiveState();

			selected = rState.selectedRows[0];

			tbl.intercept("select-row", (ev) => {
				if (ev.id == 1) {
					helpers.showNotice({ text: "Cannot be selected: " + ev.id, type: "warning" });

					return false;
				}
			});
		}

		function addRow() {
			tbl.exec("add-row", { row: {} });
		}

		function deleteRow() {
			const id = tbl.getState().selectedRows[0];

			if (id) {
				tbl.exec("delete-row", { id });
			}
		}

		function onSelectRow(ev) {
			helpers.showNotice({ text: "Selected: " + ev.id, type: "info" });
		}

		$$renderer.push(`<div style="padding: 20px;"><p>`);

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
				$$renderer.push(`<!---->Delete row`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => data = otherData,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Other Data`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p> <div style="max-width: 800px;">`);
		Grid($$renderer, { data, columns, init, onselectrow: onSelectRow });
		$$renderer.push(`<!----></div> <div class="status svelte-18nfjwp">Selected: ${$.escape($.store_get($$store_subs ??= {}, '$selected', selected) || "none")}</div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}