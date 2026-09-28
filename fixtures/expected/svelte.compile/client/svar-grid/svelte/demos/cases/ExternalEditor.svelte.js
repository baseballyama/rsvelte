import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RichSelect, Switch, DatePicker, MultiCombo } from "@svar-ui/svelte-core";
import { Editor, registerEditorItem } from "@svar-ui/svelte-editor";
import { Grid, getEditorConfig } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>Grid - dbl-click to show external editor</h4> <div style="height: 320px; max-width: 800px;"><!></div> <!></div>`);

export default function ExternalEditor($$anchor, $$props) {
	$.push($$props, true);

	const { allData: data, countries, users } = getData();
	let api = $.state(void 0);

	const columns = [
		{ id: "id", width: 50 },
		{ id: "firstName", header: "Name", editor: "text", width: 160 },
		{
			id: "country",
			header: "Country",
			editor: "richselect",
			options: countries,
			width: 160
		},

		{
			id: "checked",
			hidden: true,
			header: "Active",
			editor: "switch",
			width: 160
		},

		{
			id: "newsletter",
			header: "Newsletter",
			editor: "checkbox",
			width: 100,
			template: (v) => v ? "yes" : "no"
		},

		{
			id: "date",
			header: "Date",
			width: 100,
			editor: "datepicker",
			template: (v) => v ? v.toLocaleDateString() : ""
		},

		{
			id: "assigned",
			header: "Users",
			width: 100,
			editor: "multicombo",
			options: users
		},

		{
			id: "companyName",
			header: "Description",
			editor: "textarea",
			flexgrow: 1
		}
	];

	// Here are sections
	registerEditorItem("richselect", RichSelect);

	registerEditorItem("switch", Switch);
	registerEditorItem("datepicker", DatePicker);
	registerEditorItem("multicombo", MultiCombo);

	let dataToEdit = $.state(null);

	const init = (api) => {
		api.intercept("open-editor", ({ id }) => {
			$.set(dataToEdit, api.getRow(id), true);

			return false;
		});

		api.on("select-row", ({ id }) => {
			if ($.get(dataToEdit)) {
				$.set(dataToEdit, id ? api.getRow(id) : null, true);
			}
		});
	};

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	$.bind_this(
		Grid(node, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},
			init
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

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

					topBar: {
						items: [
							{ comp: "icon", icon: "wxi-close", id: "close" },
							{ comp: "spacer" },
							{ comp: "button", type: "danger", text: "Delete", id: "delete" },
							{ comp: "button", type: "primary", text: "Save", id: "save" }
						]
					},
					placement: 'sidebar',
					onsave: ({ values }) => {
						$.get(api).exec("update-row", { id: $.get(dataToEdit).id, row: values });
					},

					onaction: ({ item }) => {
						if (item.id === "delete") $.get(api).exec("delete-row", { id: $.get(dataToEdit).id });
						if (item.comp) $.set(dataToEdit, null);
					}
				});
			}
		};

		$.if(node_1, ($$render) => {
			if ($.get(dataToEdit)) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}