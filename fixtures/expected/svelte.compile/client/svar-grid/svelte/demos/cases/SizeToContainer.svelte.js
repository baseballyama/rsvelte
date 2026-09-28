import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider, Field, Checkbox } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData, repeatColumns } from "../data";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div style="padding: 20px;"><h4>DataGrid adjusts to the container</h4> <!> <div class="controls svelte-yctoe6"><!></div> <h3>Columns with fixed widths</h3> <div class="container svelte-yctoe6"><!></div> <h3>Columns with flexible widths</h3> <div class="container svelte-yctoe6"><!></div> <h3>A lot of columns</h3> <div class="container svelte-yctoe6"><!></div></div>`);

export default function SizeToContainer($$anchor, $$props) {
	$.push($$props, true);

	const { data, columns, flexibleColumns } = getData();
	let w = $.state(600);
	let h = $.state(320);
	let psize = $.state(false);
	var div = root_1();
	var node = $.sibling($.child(div), 2);

	Field(node, {
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'Fill screen',
				get value() {
					return $.get(psize);
				},

				set value($$value) {
					$.set(psize, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Slider(node_2, {
				get label() {
					return `Container width: ${$.get(w) ?? ''}px`;
				},
				min: 200,
				max: 800,
				get value() {
					return $.get(w);
				},

				set value($$value) {
					$.set(w, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				get label() {
					return `Container height: ${$.get(h) ?? ''}px`;
				},
				min: 200,
				max: 800,
				get value() {
					return $.get(h);
				},

				set value($$value) {
					$.set(h, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (!$.get(psize)) $$render(consequent);
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 4);
	var node_4 = $.child(div_2);

	{
		let $0 = $.derived(() => data.slice(0, 15));

		Grid(node_4, {
			get data() {
				return $.get($0);
			},

			get columns() {
				return columns;
			}
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 4);
	var node_5 = $.child(div_3);

	{
		let $0 = $.derived(() => data.slice(0, 15));

		Grid(node_5, {
			get data() {
				return $.get($0);
			},

			get columns() {
				return flexibleColumns;
			}
		});
	}

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 4);
	var node_6 = $.child(div_4);

	{
		let $0 = $.derived(() => data.slice(0, 15));
		let $1 = $.derived(() => repeatColumns(50));

		Grid(node_6, {
			get data() {
				return $.get($0);
			},

			get columns() {
				return $.get($1);
			}
		});
	}

	$.reset(div_4);
	$.reset(div);

	$.template_effect(() => {
		$.set_style(div_2, $.get(psize)
			? "width:100%; height: 50%;"
			: `width:${$.get(w)}px;height:${$.get(h)}px`);

		$.set_style(div_3, $.get(psize)
			? "width:100%; height: 50%;"
			: `width:${$.get(w)}px;height:${$.get(h)}px`);

		$.set_style(div_4, $.get(psize)
			? "width:100%; height: 50%;"
			: `width:${$.get(w)}px;height:${$.get(h)}px`);
	});

	$.append($$anchor, div);
	$.pop();
}