import * as $ from 'svelte/internal/server';
import { Button } from "@svar-ui/svelte-core";
import { RestDataProvider } from "@svar-ui/grid-data-provider";
import { Grid } from "../../src/";

export default function RestBackend($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const columns = [
			{
				id: "name",
				header: "Title",
				flexgrow: 1,
				sort: true,
				editor: "text"
			},

			{
				id: "year",
				header: "Year",
				width: 100,
				sort: true,
				editor: "text"
			},

			{
				id: "votes",
				header: "Votes",
				width: 100,
				sort: true,
				editor: "text"
			}
		];

		let data = [];

		const provider = new RestDataProvider("https://grid-backend.svar.dev/films", (obj) => {
			obj.year = obj.year * 1;
			obj.votes = obj.votes * 1;
		});

		provider.getData().then((v) => data = v);

		let api = void 0;

		const deleteRow = () => {
			const id = api.getState().selectedRows[0];

			if (id) {
				api.exec("delete-row", { id });
			}
		};

		const addRow = () => {
			api.exec("add-row", { row: { name: "New Film", year: "2022", votes: 1 } });
		};

		const init = (api) => {
			api.setNext(provider);
		};

		$$renderer.push(`<div style="padding: 20px; height: 600px;"><div style="padding-bottom: 10px;">`);

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

		$$renderer.push(`<!----></div> `);
		Grid($$renderer, { data, columns, init });
		$$renderer.push(`<!----></div>`);
	});
}