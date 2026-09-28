import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { getData } from "../data";
import { Willow, Locale } from "@svar-ui/svelte-core";

var root = $.from_html(`<div class="demo svelte-1i2jdcc"><!></div> <div class="demo svelte-1i2jdcc"><!></div>`, 1);

export default function TableHeaderFooterVertical($$anchor, $$props) {
	$.push($$props, true);

	const {
		allData: data,
		columnsVertical: columns,
		columnsSpansVertical: scolumns
	} = getData();

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var div = $.first_child(fragment_2);
					var node = $.child(div);

					Grid(node, {
						get data() {
							return data;
						},

						get columns() {
							return columns;
						},
						footer: true
					});

					$.reset(div);

					var div_1 = $.sibling(div, 2);
					var node_1 = $.child(div_1);

					Grid(node_1, {
						get data() {
							return data;
						},

						get columns() {
							return scolumns;
						},
						footer: true
					});

					$.reset(div_1);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}