import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { Grid } from "../../src";
import { Button } from "@svar-ui/svelte-core";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><p><!> <!> <!></p> <div style="max-width: 800px;"><!></div> <div class="status svelte-18nfjwp"> </div></div>`);

export default function TableAPI($$anchor, $$props) {
	$.push($$props, true);

	const $selected = () => $.store_get($.get(selected), '$selected', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { allData } = getData();
	let data = $.state($.proxy(allData.slice(0, 10)));
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
	let tbl = $.state(void 0);
	let selected = $.state(void 0);

	function init(tbl) {
		const rState = tbl.getReactiveState();

		$.store_unsub($.set(selected, rState.selectedRows[0], true), '$selected', $$stores);

		tbl.intercept("select-row", (ev) => {
			if (ev.id == 1) {
				helpers.showNotice({ text: "Cannot be selected: " + ev.id, type: "warning" });

				return false;
			}
		});
	}

	function addRow() {
		$.get(tbl).exec("add-row", { row: {} });
	}

	function deleteRow() {
		const id = $.get(tbl).getState().selectedRows[0];

		if (id) {
			$.get(tbl).exec("delete-row", { id });
		}
	}

	function onSelectRow(ev) {
		helpers.showNotice({ text: "Selected: " + ev.id, type: "info" });
	}

	var div = root();
	var p = $.child(div);
	var node = $.child(p);

	Button(node, {
		onclick: addRow,
		type: 'primary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Add row');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: deleteRow,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Delete row');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => $.set(data, otherData, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Other Data');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(p);

	var div_1 = $.sibling(p, 2);
	var node_3 = $.child(div_1);

	$.bind_this(
		Grid(node_3, {
			get data() {
				return $.get(data);
			},

			get columns() {
				return columns;
			},
			init,
			onselectrow: onSelectRow
		}),
		($$value) => $.set(tbl, $$value, true),
		() => $.get(tbl)
	);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var text_3 = $.only_child(div_2);

	$.reset(div);
	$.template_effect(() => $.set_text(text_3, `Selected: ${($selected() || "none") ?? ''}`));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}