import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid, getEditorConfig } from "../../src";
import { Toolbar } from "@svar-ui/svelte-toolbar";
import { Editor, registerEditorItem } from "@svar-ui/svelte-editor";
import { RichSelect, DatePicker } from "@svar-ui/svelte-core";

export default function ExternalToolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data, countries } = getData();
		let api = void 0;
		let dataToEdit = null;
		let history = void 0;
		let selectedRows = void 0;

		function init(obj) {
			api = obj;
			history = api.getReactiveState().history;
			selectedRows = api.getReactiveState().selectedRows;

			api.intercept("open-editor", () => {
				return false;
			});
		}

		const columns = [
			{ id: "id", width: 50 },
			{
				id: "firstName",
				header: "First Name",
				editor: "text",
				width: 160
			},

			{
				id: "lastName",
				header: "Last Name",
				editor: "text",
				width: 160
			},

			{
				id: "country",
				header: "Country",
				editor: "richselect",
				options: countries,
				width: 160
			},

			{
				id: "date",
				header: "Date",
				width: 100,
				editor: "datepicker",
				template: (v) => v ? v.toLocaleDateString() : ""
			},

			{
				id: "companyName",
				header: "Description",
				editor: "textarea",
				flexgrow: 1
			}
		];

		registerEditorItem("richselect", RichSelect);
		registerEditorItem("datepicker", DatePicker);

		function onClick(item) {
			switch (item.id) {
				case "add-before":
					{
						const { selectedRows, data } = api.getState();
						const id = selectedRows[0];

						if (id) api.exec("add-row", { row: {}, before: id }); else if (data.length) api.exec("add-row", { row: {}, before: data[0].id });

						break;
					}

				case "add-after":
					{
						const id = api.getState().selectedRows[0];

						if (id) api.exec("add-row", { row: {}, after: id }); else api.exec("add-row", { row: {} });

						break;
					}

				case "delete":
					{
						const id = api.getState().selectedRows[0];

						if (id) api.exec("delete-row", { id });

						break;
					}

				case "edit":
					{
						const id = api.getState().selectedRows[0];

						if (id) dataToEdit = api.getRow(id);

						break;
					}

				case "undo":
					api.exec("undo");
					break;

				case "redo":
					api.exec("redo");
					break;
			}
		}

		const items = [
			{
				id: "add-before",
				comp: "button",
				icon: "wxi-plus",
				text: "Add: before",
				type: "primary",
				handler: onClick
			},

			{
				id: "add-after",
				comp: "button",
				icon: "wxi-plus",
				text: "Add: after",
				type: "primary",
				handler: onClick
			},
			{ comp: "separator" },
			{ id: "edit", comp: "icon", icon: "wxi-edit", handler: onClick },
			{
				id: "delete",
				comp: "icon",
				icon: "wxi-delete",
				handler: onClick
			},
			{ comp: "spacer" },
			{ id: "undo", comp: "icon", icon: "wxi-undo", handler: onClick },
			{
				id: "redo",
				comp: "button",
				icon: "wxi-redo",
				handler: onClick
			}
		];

		const normalizedItems = $.derived(() => {
			if (api) {
				return items.map((item) => {
					switch (item.id) {
						case "edit":

						case "delete":
							{
								return {
									...item,
									disabled: !$.store_get($$store_subs ??= {}, '$selectedRows', selectedRows).length
								};
							}

						case "undo":
							{
								return {
									...item,
									disabled: !$.store_get($$store_subs ??= {}, '$history', history).undo
								};
							}

						case "redo":
							{
								return {
									...item,
									disabled: !$.store_get($$store_subs ??= {}, '$history', history).redo
								};
							}

						default:
							{
								return item;
							}
					}
				});
			}
		});

		$$renderer.push(`<div style="padding: 20px;">`);
		Toolbar($$renderer, { items: normalizedItems() });
		$$renderer.push(`<!----> `);
		Grid($$renderer, { data, columns, init, undo: true });
		$$renderer.push(`<!----></div> `);

		if (dataToEdit) {
			$$renderer.push('<!--[0-->');

			Editor($$renderer, {
				values: dataToEdit,
				items: getEditorConfig(columns),
				placement: 'sidebar',
				onsave: ({ values }) => {
					api.exec("update-row", { id: dataToEdit.id, row: values });
				},
				onaction: () => dataToEdit = null
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}