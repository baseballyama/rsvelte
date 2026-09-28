import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from "svelte";
import { Slider, Button } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { repeatData, repeatColumns } from "../data";
import { timer, timerEnd } from "../custom/timers";

var root = $.from_html(`<pre> </pre>`);
var root_1 = $.from_html(`<div style="padding: 20px;"><h4>Load and render big data at once</h4> <div style="width: 320px; padding-bottom: 20px;"><!></div> <div style="width: 320px; padding-bottom: 20px;"><!></div> <div style="width: 320px; padding-bottom: 20px;"><!></div> <div style="width: 1000px; height: 600px;"><!></div> <!></div>`);

export default function StaticData($$anchor, $$props) {
	$.push($$props, true);

	// svelte-ignore non_reactive_update
	let data = [];

	// svelte-ignore non_reactive_update
	let columns = [];

	let stats = $.state(null);
	let counter = $.state(1);
	let rows = $.state(1000);
	let cols = $.state(100);

	function genAndLoad() {
		timer("gen");
		$.set(stats, null);
		data = repeatData(+$.get(rows));
		columns = repeatColumns(+$.get(cols));
		$.set(counter, $.get(counter) + 1);

		const gen = timerEnd("gen");

		timer("render");

		tick().then(() => {
			setTimeout(
				() => {
					const render = timerEnd("render");
					const full = gen + render;

					$.set(stats, { gen, render, full }, true);
				},
				1
			);
		});
	}

	genAndLoad();

	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Slider(node, {
		get label() {
			return `Rows: ${$.get(rows) ?? ''}`;
		},
		min: 2,
		max: 200000,
		get value() {
			return $.get(rows);
		},

		set value($$value) {
			$.set(rows, $$value, true);
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Slider(node_1, {
		get label() {
			return `Columns: ${$.get(cols) ?? ''}`;
		},
		min: 2,
		max: 20000,
		get value() {
			return $.get(cols);
		},

		set value($$value) {
			$.set(cols, $$value, true);
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Button(node_2, {
		type: 'primary',
		onclick: genAndLoad,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Generate data and load');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_3 = $.child(div_4);

	$.key(node_3, () => $.get(counter), ($$anchor) => {
		Grid($$anchor, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},
			split: { left: 1 }
		});
	});

	$.reset(div_4);

	var node_4 = $.sibling(div_4, 2);

	{
		var consequent = ($$anchor) => {
			var pre = root();
			var text_1 = $.only_child(pre);

			$.template_effect(() => $.set_text(text_1, `${$.get(rows) ?? ''} rows, ${$.get(cols) ?? ''} columns, ${$.get(rows) * $.get(cols)} cells
dataset generation: ${$.get(stats).gen ?? ''}ms
dataset rendering: ${$.get(stats).render ?? ''}ms`));

			$.append($$anchor, pre);
		};

		$.if(node_4, ($$render) => {
			if ($.get(stats)) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}