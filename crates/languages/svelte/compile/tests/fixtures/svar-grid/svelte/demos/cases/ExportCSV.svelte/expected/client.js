import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { Button } from "@svar-ui/svelte-core";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><p><!></p> <div style="max-width: 800px;"><!></div></div> <div style="padding: 20px;"><p><!></p> <div style="max-width: 800px;"><!></div></div>`, 1);

export default function ExportCSV($$anchor, $$props) {
	$.push($$props, true);

	const { clientData, clientColumns, treeData, treeFixedColumns } = getData();
	let api1 = $.state(void 0);
	let api2 = $.state(void 0);

	function exportCsv(api) {
		api.exec("export-data", { format: "csv", fileName: "clients", csv: { cols: ";" } });
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var p = $.child(div);
	var node = $.child(p);

	Button(node, {
		type: 'primary',
		onclick: () => exportCsv($.get(api1)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Export to CSV');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(p);

	var div_1 = $.sibling(p, 2);
	var node_1 = $.child(div_1);

	$.bind_this(
		Grid(node_1, {
			footer: true,
			get data() {
				return clientData;
			},

			get columns() {
				return clientColumns;
			}
		}),
		($$value) => $.set(api1, $$value, true),
		() => $.get(api1)
	);

	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var p_1 = $.child(div_2);
	var node_2 = $.child(p_1);

	Button(node_2, {
		type: 'primary',
		onclick: () => exportCsv($.get(api2)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Export to CSV');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(p_1);

	var div_3 = $.sibling(p_1, 2);
	var node_3 = $.child(div_3);

	$.bind_this(
		Grid(node_3, {
			tree: true,
			get data() {
				return treeData;
			},

			get columns() {
				return treeFixedColumns;
			},
			footer: true
		}),
		($$value) => $.set(api2, $$value, true),
		() => $.get(api2)
	);

	$.reset(div_3);
	$.reset(div_2);
	$.append($$anchor, fragment);
	$.pop();
}