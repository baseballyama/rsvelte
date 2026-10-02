import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { Button, Field, RadioButtonGroup } from "@svar-ui/svelte-core";
import { repeatData, repeatColumns } from "../data";

export default function PrintWideGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = repeatData(100);
		const columns = repeatColumns(20);
		let mode = "portrait";
		let paper = "a4";

		const modes = [
			{ id: "portrait", label: "Portrait" },
			{ id: "landscape", label: "Landscape" }
		];

		const papers = [
			{ id: "a3", label: "a3" },
			{ id: "a4", label: "a4" },
			{ id: "letter", label: "letter" }
		];

		let api = void 0;

		function printGrid() {
			api.exec("print", { mode, paper });
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="demo" style="padding: 20px;"><div class="config svelte-3g0hu5">`);

			Field($$renderer, {
				label: 'Mode',
				position: 'left',
				type: 'checkbox',
				children: ($$renderer) => {
					RadioButtonGroup($$renderer, {
						options: modes,
						type: 'inline',
						get value() {
							return mode;
						},

						set value($$value) {
							mode = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Paper',
				position: 'left',
				type: 'checkbox',
				children: ($$renderer) => {
					RadioButtonGroup($$renderer, {
						options: papers,
						type: 'inline',
						get value() {
							return paper;
						},

						set value($$value) {
							paper = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <h4>Print grid</h4> <div>`);

			Button($$renderer, {
				onclick: printGrid,
				type: "primary",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Print Grid`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div style="height: 400px; margin-top: 10px;">`);
			Grid($$renderer, { data, columns });
			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}