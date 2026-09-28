import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, Slider } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px;"><h4>Drag the slider to fix columns on the left</h4> <div class="controls svelte-hadqve"><!></div> <div style="max-width: 800px;"><!></div></div>`);

export default function FixedColumns($$anchor, $$props) {
	$.push($$props, true);

	const { data, allColumns } = getData();
	let left = $.state(2);
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
				return allColumns;
			},

			get split() {
				return $.get($0);
			}
		});
	}

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}