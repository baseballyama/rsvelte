import * as $ from 'svelte/internal/server';
import { Field, Slider } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData } from "../data";

export default function FixedRightColumns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, allColumns: columns } = getData();
		let right = 2;

		const columnsSpans = [
			{
				id: "id",
				width: 50,
				footer: { text: "All users", colspan: 6 }
			},

			{
				id: "firstName",
				header: [
					{ text: "Main client info", colspan: 3, collapsible: true },
					{ text: "First Name" }
				],
				width: 150,
				resize: true,
				sort: true
			},

			{
				id: "lastName",
				header: ["", "Last Name"],
				width: 150,
				resize: true,
				sort: true
			},

			{
				id: "email",
				header: ["", "Email"],
				width: 250,
				resize: true,
				sort: true
			},

			{
				id: "companyName",
				header: [
					{ text: "Company", colspan: 2, collapsible: true },
					{ text: "Name" }
				],
				width: 200,
				resize: true,
				sort: true
			},
			{ id: "city", width: 200, header: ["", "City"] },
			{
				id: "followers",
				header: [{ text: "Stats", colspan: 2 }, { text: "Folowers" }],
				footer: { text: data.length, colspan: 3, css: "right" },
				resize: true,
				width: 100
			},

			{
				id: "stars",
				header: ["", "Stars"],
				width: 100,
				resize: true,
				footer: { text: "10" }
			},

			{
				id: "date",
				template: (obj) => obj.toDateString(),
				header: "Joined",
				footer: { text: "" }
			}
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="demo svelte-1g8xwz" style="padding: 20px;"><h4>Drag the slider to fix columns on the right</h4> <div class="controls svelte-1g8xwz">`);

			Field($$renderer, {
				label: 'Fix columns',
				children: ($$renderer) => {
					Slider($$renderer, {
						min: 0,
						max: 4,
						get value() {
							return right;
						},

						set value($$value) {
							right = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div style="max-width: 800px;">`);
			Grid($$renderer, { data, columns, split: { right } });
			$$renderer.push(`<!----></div> <h4>Grid with fixed columns on the left and on the right</h4> <div style="max-width: 800px;">`);
			Grid($$renderer, { data, columns, split: { left: 2, right: 2 } });
			$$renderer.push(`<!----></div> <h4>Grid with multiline header and fixed columns on the right</h4> <div style="max-width: 800px;">`);

			Grid($$renderer, {
				data,
				columns: columnsSpans,
				footer: true,
				split: { right: 3 }
			});

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