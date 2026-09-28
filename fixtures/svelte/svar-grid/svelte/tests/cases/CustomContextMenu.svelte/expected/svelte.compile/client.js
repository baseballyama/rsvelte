import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid } from "../../src/";
import { ContextMenu } from "@svar-ui/svelte-menu";
import { getContext } from "svelte";
import { Willow, Locale } from "@svar-ui/svelte-core";

var root = $.from_html(`<div style="padding: 20px;"><div><!></div></div>`);

export default function CustomContextMenu($$anchor, $$props) {
	$.push($$props, true);

	const { data } = getData();

	const columns = [
		{ id: "id", width: 50 },
		{ id: "city", header: "City", width: 160, hidden: true },
		{ id: "firstName", header: "First Name", flexgrow: 1 },
		{ id: "lastName", header: "Last Name", flexgrow: 1 },
		{ id: "companyName", header: "Company", flexgrow: 1 }
	];

	let table = $.state(void 0);

	function init(api) {
		$.set(table, api, true);
	}

	const options = [
		{
			id: "add",
			text: "Add before",
			icon: "wxi-table-row-plus-before"
		},
		{ id: "duplicate", text: "Duplicate", icon: "wxi-duplicate" },
		{ id: "delete", text: "Delete", icon: "wxi-delete-outline" },
		{ type: "separator" },
		{ id: "info", text: "Info", icon: "wxi-alert" },
		{ id: "view", text: "View", icon: "wxi-external" }
	];

	const helpers = getContext("wx-helpers");

	const handleClicks = (ev) => {
		const option = ev.action;

		if (option) {
			const id = $.get(table).getState().selectedRows[0];

			switch (option.id) {
				case "add":
					$.get(table).exec("add-row", { row: {}, before: id });
					break;

				case "duplicate":
					$.get(table).exec("add-row", { row: { ...$.get(table).getRow(id), id: null }, after: id });
					break;

				case "delete":
					$.get(table).exec("delete-row", { id });
					break;

				default:
					helpers.showNotice({ text: `You clicked ${option.text}`, expire: -1 });
			}
		}
	};

	function getItem(id) {
		if (id) $.get(table).exec("select-row", { id });

		return id;
	}

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.child(div);
					var node = $.child(div_1);

					ContextMenu(node, {
						get options() {
							return options;
						},
						resolver: getItem,
						onclick: handleClicks,
						get api() {
							return $.get(table);
						},
						at: "point",
						children: ($$anchor, $$slotProps) => {
							Grid($$anchor, {
								get data() {
									return data;
								},

								get columns() {
									return columns;
								},
								init
							});
						},
						$$slots: { default: true }
					});

					$.reset(div_1);
					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}