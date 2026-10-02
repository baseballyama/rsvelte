import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src";
import { Button, Field, RadioButtonGroup } from "@svar-ui/svelte-core";
import { repeatData, repeatColumns } from "../data";

var root = $.from_html(`<div class="demo" style="padding: 20px;"><div class="config svelte-3g0hu5"><!> <!></div> <h4>Print grid</h4> <div><!></div> <div style="height: 400px; margin-top: 10px;"><!></div></div>`);

export default function PrintWideGrid($$anchor, $$props) {
	$.push($$props, true);

	const data = repeatData(100);
	const columns = repeatColumns(20);
	let mode = $.state("portrait");
	let paper = $.state("a4");

	const modes = [
		{ id: "portrait", label: "Portrait" },
		{ id: "landscape", label: "Landscape" }
	];

	const papers = [
		{ id: "a3", label: "a3" },
		{ id: "a4", label: "a4" },
		{ id: "letter", label: "letter" }
	];

	let api = $.state(void 0);

	function printGrid() {
		$.get(api).exec("print", { mode: $.get(mode), paper: $.get(paper) });
	}

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Field(node, {
		label: 'Mode',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			RadioButtonGroup($$anchor, {
				get options() {
					return modes;
				},
				type: 'inline',
				get value() {
					return $.get(mode);
				},

				set value($$value) {
					$.set(mode, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Paper',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			RadioButtonGroup($$anchor, {
				get options() {
					return papers;
				},
				type: 'inline',
				get value() {
					return $.get(paper);
				},

				set value($$value) {
					$.set(paper, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 4);
	var node_2 = $.child(div_2);

	Button(node_2, {
		onclick: printGrid,
		type: "primary",
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Print Grid');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	$.bind_this(
		Grid(node_3, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			}
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}