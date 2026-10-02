import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { getData } from "../data";
import { Willow, Locale } from "@svar-ui/svelte-core";

var root = $.from_html(`<div style="padding: 20px; width: 960px;"><!></div>`);

export default function TreeMode($$anchor, $$props) {
	$.push($$props, true);

	const { treeData, treeColumns } = getData();

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node = $.child(div);

					Grid(node, {
						tree: true,
						get data() {
							return treeData;
						},

						get columns() {
							return treeColumns;
						}
					});

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