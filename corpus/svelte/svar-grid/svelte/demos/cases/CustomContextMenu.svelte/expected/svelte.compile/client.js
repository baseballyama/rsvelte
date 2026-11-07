import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { getData } from "../data";
import { Grid, ContextMenu, defaultMenuOptions } from "../../src/";

var root = $.from_html(`<div style="padding: 20px;"><h4>Context menu with customized options</h4> <!></div>`);

export default function CustomContextMenu($$anchor, $$props) {
	$.push($$props, true);

	const { data, flexibleColumns: columns } = getData();

	// take the grid's default option set and alter it:
	// drop copy/cut/paste, then append our own options
	const options = [
		...defaultMenuOptions.filter((op) => !["copy-row", "cut-row", "paste-row"].includes(op.id)),
		{ comp: "separator" },
		{ id: "info", text: "Row info", icon: "wxi-alert" },
		{ id: "view", text: "View details", icon: "wxi-external" }
	];

	const helpers = getContext("wx-helpers");

	// built-in options (add/delete/move...) are executed by the grid itself;
	// here we only react to the custom options we added above
	const handleClicks = (ev) => {
		const option = ev.action;

		if (!option) return;

		if (option.id === "info" || option.id === "view") {
			const id = $.get(grid).getState().selectedRows[0];
			const row = id ? $.get(grid).getRow(id) : null;

			helpers.showNotice({
				text: row
					? `${option.text} — ${row.firstName} ${row.lastName}`
					: `${option.text} clicked`
			});
		}
	};

	let grid = $.state(void 0);
	var div = root();
	var node = $.sibling($.child(div), 2);

	ContextMenu(node, {
		get api() {
			return $.get(grid);
		},

		get options() {
			return options;
		},
		onclick: handleClicks,
		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Grid($$anchor, {
					get data() {
						return data;
					},

					get columns() {
						return columns;
					},
					multiselect: true,
					reorder: true
				}),
				($$value) => $.set(grid, $$value, true),
				() => $.get(grid)
			);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}