import * as $ from 'svelte/internal/server';
import { tick } from "svelte";
import { Slider, Button } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { repeatData, repeatColumns } from "../data";
import { timer, timerEnd } from "../custom/timers";

export default function StaticData($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// svelte-ignore non_reactive_update
		let data = [];

		// svelte-ignore non_reactive_update
		let columns = [];

		let stats = null;
		let counter = 1;
		let rows = 1000;
		let cols = 100;

		function genAndLoad() {
			timer("gen");
			stats = null;
			data = repeatData(+rows);
			columns = repeatColumns(+cols);
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div style="padding: 20px;"><h4>Load and render big data at once</h4> <div style="width: 320px; padding-bottom: 20px;">`);

			Slider($$renderer, {
				label: `Rows: ${$.stringify(rows)}`,
				min: 2,
				max: 200000,
				get value() {
					return rows;
				},

				set value($$value) {
					rows = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div style="width: 320px; padding-bottom: 20px;">`);

			Slider($$renderer, {
				label: `Columns: ${$.stringify(cols)}`,
				min: 2,
				max: 20000,
				get value() {
					return cols;
				},

				set value($$value) {
					cols = $$value;
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
				Grid($$renderer, { data, columns, split: { left: 1 } });
			}

			$$renderer.push(`<!----></div> `);

			if (stats) {
				$$renderer.push(`<!--[0--><pre>${$.escape(rows)} rows, ${$.escape(cols)} columns, ${$.escape(rows * cols)} cells
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