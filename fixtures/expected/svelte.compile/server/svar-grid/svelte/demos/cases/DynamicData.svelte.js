import * as $ from 'svelte/internal/server';
import { tick } from "svelte";
import { Slider, Button } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { repeatData, repeatColumns } from "../data";
import { timer, timerEnd } from "../custom/timers";
import { getContext } from "svelte";

export default function DynamicData($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const helpers = getContext("wx-helpers");
		let data = [];
		let rawData = [];
		let columns = [];
		let stats = null;
		let counter = 1;
		let rowCount = 1000;
		let columnCount = 100;
		let requestRange = { start: 0, end: 0 };

		function genAndLoad() {
			timer("gen");
			stats = null;
			rawData = repeatData(+rowCount);
			columns = repeatColumns(+columnCount);
			counter += 1;

			const gen = timerEnd("gen");

			timer("render");

			tick().then(() => {
				setTimeout(
					() => {
						const render = timerEnd("render");
						const full = gen + render;

						stats = { gen, render, full };
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
				data = rawData.slice(row.start, row.end);
				requestRange = row;
			}
		}

		function init(api) {
			api.on("move-item", (ev) => {
				const { id, target, mode } = ev;
				const index = rawData.findIndex((el) => el.id === id);
				const targetIndex = rawData.findIndex((el) => el.id === target);

				rawData.splice(mode === "before" ? targetIndex : targetIndex + 1, 0, rawData.splice(index, 1)[0]);

				if (data.findIndex((el) => el.id === id) === -1) {
					// update visible range in case the item is not present there
					data = rawData.slice(requestRange.start, requestRange.end);
				}
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div style="padding: 20px;"><h4>Load data in portions during scroll</h4> <div style="width: 320px; padding-bottom: 20px;">`);

			Slider($$renderer, {
				label: `Rows: ${$.stringify(rowCount)}`,
				min: 2,
				max: 200000,
				get value() {
					return rowCount;
				},

				set value($$value) {
					rowCount = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div style="width: 320px; padding-bottom: 20px;">`);

			Slider($$renderer, {
				label: `Columns: ${$.stringify(columnCount)}`,
				min: 2,
				max: 20000,
				get value() {
					return columnCount;
				},

				set value($$value) {
					columnCount = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div style="width: 320px; padding-bottom: 20px;">`);

			Button($$renderer, {
				type: 'primary',
				onclick: genAndLoad,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Generate data and load`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div style="width: 1000px; height: 600px;"><!---->`);

			{
				Grid($$renderer, {
					init,
					data,
					columns,
					dynamic: { rowCount, columnCount },
					onrequestdata: dataProvider,
					reorder: true
				});
			}

			$$renderer.push(`<!----></div> `);

			if (stats) {
				$$renderer.push(`<!--[0--><pre>${$.escape(rowCount)} rows, ${$.escape(columnCount)} columns, ${$.escape(rowCount * columnCount)} cells
dataset generation: ${$.escape(stats.gen)}ms
dataset rendering: ${$.escape(stats.render)}ms</pre>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}