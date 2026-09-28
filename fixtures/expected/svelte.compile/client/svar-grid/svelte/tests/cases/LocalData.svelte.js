import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { getData } from "../data";
import { Willow, Locale } from "@svar-ui/svelte-core";

var root = $.from_html(`<div style="padding: 20px; width: 360px"><!></div>`);

export default function LocalData($$anchor, $$props) {
	$.push($$props, true);

	const { data, columns } = getData();

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node = $.child(div);

					Grid(node, {
						get data() {
							return data;
						},

						get columns() {
							return columns;
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