import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { Willow, Locale } from "@svar-ui/svelte-core";
import { repeatData, repeatColumns } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><div style="width: 800px; height: 400px;"><!></div></div>`);

export default function ReorderingHandlers($$anchor, $$props) {
	$.push($$props, true);

	const rows = 100;
	const cols = 20;
	const data = repeatData(rows, cols);
	const columns = repeatColumns(cols);

	columns[0].draggable = (row) => row.id % 2 === 1;

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.child(div);
					var node = $.child(div_1);

					Grid(node, {
						get data() {
							return data;
						},

						get columns() {
							return columns;
						},
						reorder: true
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