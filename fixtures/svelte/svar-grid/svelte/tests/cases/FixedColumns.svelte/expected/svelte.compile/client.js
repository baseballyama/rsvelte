import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, Slider, Willow, Locale } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>Table with fixed / resizable columns</h4> <div class="controls svelte-19qlfyz"><!></div> <div style="height: 415px; max-width: 800px;"><!></div></div>`);

export default function FixedColumns($$anchor, $$props) {
	$.push($$props, true);

	const { allData: data, allColumns } = getData();
	let left = $.state(2);

	const columns = allColumns.map((c) => {
		if (c.id !== "id") c.editor = "text";

		return c;
	});

	Willow($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Locale($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var div_1 = $.sibling($.child(div), 2);
					var node = $.child(div_1);

					Field(node, {
						label: 'Fix columns',
						children: ($$anchor, $$slotProps) => {
							Slider($$anchor, {
								min: 0,
								max: 4,
								get value() {
									return $.get(left);
								},

								set value($$value) {
									$.set(left, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});

					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var node_1 = $.child(div_2);

					{
						let $0 = $.derived(() => ({ left: $.get(left) }));

						Grid(node_1, {
							get data() {
								return data;
							},

							get columns() {
								return columns;
							},

							get split() {
								return $.get($0);
							}
						});
					}

					$.reset(div_2);
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