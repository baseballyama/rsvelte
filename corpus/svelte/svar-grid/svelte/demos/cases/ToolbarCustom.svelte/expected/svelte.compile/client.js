import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { getData } from "../data";
import { Grid, Toolbar, defaultToolbarButtons, getEditorConfig } from "../../src";
import { Editor, registerEditorItem } from "@svar-ui/svelte-editor";
import { RichSelect, DatePicker } from "@svar-ui/svelte-core";

var root = $.from_html(`<div style="padding: 20px;"><!> <!></div> <!>`, 1);

export default function ToolbarCustom($$anchor, $$props) {
	$.push($$props, true);

	const helpers = getContext("wx-helpers");
	const { data, countries } = getData();
	let api = $.state(void 0);
	let dataToEdit = $.state(null);

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

	// filter default buttons
	const outButtons = ["copy-row", "cut-row", "paste-row"];

	const items = defaultToolbarButtons.filter((b) => {
		return !outButtons.includes(b.id);
	});

	items.splice(1, 0, { id: "my-action", comp: "icon", icon: "wxi-cat" });

	function handleClick(ev) {
		if (ev.item.id === "my-action") {
			helpers.showNotice({ text: "'My action' clicked" });
		}
	}

	function init(obj) {
		$.set(api, obj, true);

		$.get(api).intercept("open-editor", () => {
			const id = $.get(api).getState().selectedRows[0];

			if (id) $.set(dataToEdit, $.get(api).getRow(id), true);

			return false;
		});
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Toolbar(node, {
		get api() {
			return $.get(api);
		},

		get items() {
			return items;
		},
		onclick: handleClick
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
}