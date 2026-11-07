import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { Grid } from "../../src";
import { ActionMenu } from "@svar-ui/svelte-menu";
import { getData } from "../data";
import ButtonCell from "../custom/ButtonCell.svelte";
import CheckboxCell from "../custom/CheckboxCell.svelte";
import IconCell from "../custom/IconCell.svelte";
import HeaderCheckboxCell from "../custom/HeaderCheckboxCell.svelte";
import HeaderButtonCell from "../custom/HeaderButtonCell.svelte";

var root = $.from_html(`<div class="demo svelte-1xv6noa" style="padding: 20px;"><!></div>`);

export default function CustomEmbedingActions($$anchor, $$props) {
	$.push($$props, true);

	const helpers = getContext("wx-helpers");

	let tmp = getData(),
		data = $.state($.proxy(tmp.data));

	let api = $.state(void 0);

	const columns = [
		{
			id: "menu",
			cell: IconCell,
			header: [{ cell: HeaderButtonCell }],
			width: 134
		},

		{
			id: "checked",
			cell: CheckboxCell,
			header: [{ cell: HeaderCheckboxCell }],
			width: 36
		},
		{ id: "firstName", header: "First Name", editor: "text" },
		{ id: "lastName", header: "Last Name", editor: "text" },
		{ id: "email", header: "Email", editor: "text" },
		{
			id: "city",
			header: "City",
			cell: ButtonCell,
			editor: "text",
			width: 260
		}
	];

	const options = [
		{
			id: "add-row:before",
			text: "Add before",
			icon: "wxi-table-row-plus-before"
		},

		{
			id: "add-row:after",
			text: "Add after",
			icon: "wxi-table-row-plus-after"
		},

		{
			id: "duplicate-row",
			text: "Duplicate",
			icon: "wxi-duplicate"
		},
		{ id: "delete-row", text: "Delete", icon: "wxi-delete-outline" }
	];

	function action(action, ev) {
		const { row, column, value } = ev;
		const event = `Event: ${action}\n`;
		const val = `value: ${value}\n`;
		const r = `Row ID: ${row}\n`;
		const c = `Col ID: ${column}\n`;

		helpers.showNotice({ text: event + (action === "header-checkbox" ? val : r + c) });

		if (action === "header-checkbox") onHeaderCheck(ev);
	}

	function onHeaderCheck(ev) {
		const { value, eventSource } = ev;

		if (eventSource == "click") {
			$.set(
				data,
				$.get(api).getState().data.map((d) => {
					d.checked = value;

					return d;
				}),
				true
			);
		}
	}

	const handleClicks = (ev) => {
		const option = ev.action;

		if (option) {
			const id = $.get(api).getState().selectedRows[0];

			switch (option.id) {
				case "add-row:before":
					$.get(api).exec("add-row", { row: {}, before: id });
					break;

				case "add-row:after":
					$.get(api).exec("add-row", { row: {}, after: id });
					break;

				case "duplicate-row":
					$.get(api).exec("add-row", { row: { ...$.get(api).getRow(id), id: null }, after: id });
					break;

				case "delete-row":
					$.get(api).exec("delete-row", { id });
					break;
			}
		}
	};

	var div = root();
	var node = $.child(div);

	ActionMenu(node, {
		resolver: (id) => id,
		at: "point",
		dataKey: "actionId",
		get options() {
			return options;
		},
		onclick: handleClicks,
		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Grid($$anchor, {
					cellStyle: (row, col) => col.id == "city" ? "button_cell" : "",
					get data() {
						return $.get(data);
					},

					get columns() {
						return columns;
					},
					oncustombutton: (ev) => action("button", ev),
					oncustomicon: (ev) => action("icon", ev),
					oncustomcheck: (ev) => action("checkbox", ev),
					oncustomheadercheck: (ev) => action("header-checkbox", ev)
				}),
				($$value) => $.set(api, $$value, true),
				() => $.get(api)
			);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}