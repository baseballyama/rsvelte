import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid, getEditorConfig } from "../../src";
import { Toolbar } from "@svar-ui/svelte-toolbar";
import { Editor, registerEditorItem } from "@svar-ui/svelte-editor";
import { RichSelect, DatePicker } from "@svar-ui/svelte-core";

var root = $.from_html(`<div style="padding: 20px;"><!> <!></div> <!>`, 1);

export default function ExternalToolbar($$anchor, $$props) {
	$.push($$props, true);

	const $selectedRows = () => $.store_get($.get(selectedRows), '$selectedRows', $$stores);
	const $history = () => $.store_get($.get(history), '$history', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data, countries } = getData();
	let api = $.state(void 0);
	let dataToEdit = $.state(null);
	let history = $.state(void 0);
	let selectedRows = $.state(void 0);

	function init(obj) {
		$.set(api, obj, true);
		$.store_unsub($.set(history, $.get(api).getReactiveState().history, true), '$history', $$stores);
		$.store_unsub($.set(selectedRows, $.get(api).getReactiveState().selectedRows, true), '$selectedRows', $$stores);

		$.get(api).intercept("open-editor", () => {
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
					const { selectedRows, data } = $.get(api).getState();
					const id = selectedRows[0];

					if (id) $.get(api).exec("add-row", { row: {}, before: id }); else if (data.length) $.get(api).exec("add-row", { row: {}, before: data[0].id });

					break;
				}

			case "add-after":
				{
					const id = $.get(api).getState().selectedRows[0];

					if (id) $.get(api).exec("add-row", { row: {}, after: id }); else $.get(api).exec("add-row", { row: {} });

					break;
				}

			case "delete":
				{
					const id = $.get(api).getState().selectedRows[0];

					if (id) $.get(api).exec("delete-row", { id });

					break;
				}

			case "edit":
				{
					const id = $.get(api).getState().selectedRows[0];

					if (id) $.set(dataToEdit, $.get(api).getRow(id), true);

					break;
				}

			case "undo":
				$.get(api).exec("undo");
				break;

			case "redo":
				$.get(api).exec("redo");
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
		if ($.get(api)) {
			return items.map((item) => {
				switch (item.id) {
					case "edit":

					case "delete":
						{
							return { ...item, disabled: !$selectedRows().length };
						}

					case "undo":
						{
							return { ...item, disabled: !$history().undo };
						}

					case "redo":
						{
							return { ...item, disabled: !$history().redo };
						}

					default:
						{
							return item;
						}
				}
			});
		}
	});

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Toolbar(node, {
		get items() {
			return $.get(normalizedItems);
		}
	});

	var node_1 = $.sibling(node, 2);

	Grid(node_1, {
		get data() {
			return data;
		},

		get columns() {
			return columns;
		},
		init,
		undo: true
	});

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => getEditorConfig(columns));

				Editor($$anchor, {
					get values() {
						return $.get(dataToEdit);
					},

					get items() {
						return $.get($0);
					},
					placement: 'sidebar',
					onsave: ({ values }) => {
						$.get(api).exec("update-row", { id: $.get(dataToEdit).id, row: values });
					},
					onaction: () => $.set(dataToEdit, null)
				});
			}
		};

		$.if(node_2, ($$render) => {
			if ($.get(dataToEdit)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}