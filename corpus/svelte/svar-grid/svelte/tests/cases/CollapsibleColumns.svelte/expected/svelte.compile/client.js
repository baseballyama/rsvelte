import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid } from "../../src";
import { Willow, Locale } from "@svar-ui/svelte-core";

var root = $.from_html(`<div class="demo svelte-hlgz5" style="padding: 20px;"><div><!></div></div> <div class="demo svelte-hlgz5" style="padding: 20px;"><div><!></div></div>`, 1);

export default function CollapsibleColumns($$anchor, $$props) {
	$.push($$props, true);

	const { data, collapsibleColumns } = getData();

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var div = $.first_child(fragment_2);
					var div_1 = $.child(div);
					var node = $.child(div_1);

					{
						let $0 = $.derived(() => collapsibleColumns("first"));

						Grid(node, {
							get data() {
								return data;
							},

							get columns() {
								return $.get($0);
							},
							footer: true
						});
					}

					$.reset(div_1);
					$.reset(div);

					var div_2 = $.sibling(div, 2);
					var div_3 = $.child(div_2);
					var node_1 = $.child(div_3);

					{
						let $0 = $.derived(collapsibleColumns);

						Grid(node_1, {
							get data() {
								return data;
							},

							get columns() {
								return $.get($0);
							},
							footer: true
						});
					}

					$.reset(div_3);
					$.reset(div_2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}