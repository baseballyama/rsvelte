import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from "svelte";
import { Slider, Button } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { repeatData, repeatColumns } from "../data";
import { timer, timerEnd } from "../custom/timers";
import { getContext } from "svelte";

var root = $.from_html(`<pre> </pre>`);
var root_1 = $.from_html(`<div style="padding: 20px;"><h4>Load data in portions during scroll</h4> <div style="width: 320px; padding-bottom: 20px;"><!></div> <div style="width: 320px; padding-bottom: 20px;"><!></div> <div style="width: 320px; padding-bottom: 20px;"><!></div> <div style="width: 1000px; height: 600px;"><!></div> <!></div>`);

export default function DynamicData($$anchor, $$props) {
	$.push($$props, true);

	const helpers = getContext("wx-helpers");
	let data = $.state($.proxy([]));
	let rawData = [];
	let columns = $.state($.proxy([]));
	let stats = $.state(null);
	let counter = $.state(1);
	let rowCount = $.state(1000);
	let columnCount = $.state(100);
	let requestRange = $.state($.proxy({ start: 0, end: 0 }));

	function genAndLoad() {
		timer("gen");
		$.set(stats, null);
		rawData = repeatData(+$.get(rowCount));
		$.set(columns, repeatColumns(+$.get(columnCount)), true);
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

	function dataProvider(ev) {
		const { row } = ev;

		if (row.start) //mute notice for 1st request for testing purposes
		helpers.showNotice({ text: `Request data: ${row.start} - ${row.end}` });

		if (row) {
			$.set(data, rawData.slice(row.start, row.end), true);
			$.set(requestRange, row, true);
		}
	}

	function init(api) {
		api.on("move-item", (ev) => {
			const { id, target, mode } = ev;
			const index = rawData.findIndex((el) => el.id === id);
			const targetIndex = rawData.findIndex((el) => el.id === target);

			rawData.splice(mode === "before" ? targetIndex : targetIndex + 1, 0, rawData.splice(index, 1)[0]);

			if ($.get(data).findIndex((el) => el.id === id) === -1) {
				// update visible range in case the item is not present there
				$.set(data, rawData.slice($.get(requestRange).start, $.get(requestRange).end), true);
			}
		});
	}

	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Slider(node, {
		get label() {
			return `Rows: ${$.get(rowCount) ?? ''}`;
		},
		min: 2,
		max: 200000,
		get value() {
			return $.get(rowCount);
		},

		set value($$value) {
			$.set(rowCount, $$value, true);
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Slider(node_1, {
		get label() {
			return `Columns: ${$.get(columnCount) ?? ''}`;
		},
		min: 2,
		max: 20000,
		get value() {
			return $.get(columnCount);
		},

		set value($$value) {
			$.set(columnCount, $$value, true);
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
		{
			let $0 = $.derived(() => ({ rowCount: $.get(rowCount), columnCount: $.get(columnCount) }));

			Grid($$anchor, {
				init,
				get data() {
					return $.get(data);
				},

				get columns() {
					return $.get(columns);
				},

				get dynamic() {
					return $.get($0);
				},
				onrequestdata: dataProvider,
				reorder: true
			});
		}
	});

	$.reset(div_4);

	var node_4 = $.sibling(div_4, 2);

	{
		var consequent = ($$anchor) => {
			var pre = root();
			var text_1 = $.only_child(pre);

			$.template_effect(() => $.set_text(text_1, `${$.get(rowCount) ?? ''} rows, ${$.get(columnCount) ?? ''} columns, ${$.get(rowCount) * $.get(columnCount)} cells
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