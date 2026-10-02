import * as $ from 'svelte/internal/server';
import { Button } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { repeatData, repeatColumns } from "../data";

export default function ScrollTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = repeatData(1000);
		const columns = repeatColumns(100);
		let api = void 0;

		function doScroll(row, column) {
			api.exec("scroll", { row, column });
		}

		function doScrollTo(top, left) {
			api.exec("scroll-to", { top, left });
		}

		$$renderer.push(`<div style="padding: 20px;"><div style="padding-bottom: 20px; display:flex; flex-direction: columns; gap: 20px;">`);

		Button($$renderer, {
			type: 'primary',
			onclick: () => doScroll(data[999].id),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Scroll to the last row`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'primary',
			onclick: () => doScroll(null, columns[99].id),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Scroll to the last column`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'primary',
			onclick: () => doScroll(data[0].id, columns[1].id),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Scroll to the first row and column`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div style="padding-bottom: 20px; display:flex; flex-direction: columns; gap: 20px;">`);

		Button($$renderer, {
			type: 'primary',
			onclick: () => doScrollTo(5000, 0),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Scroll to top: 5000`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'primary',
			onclick: () => doScrollTo(0, 2000),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Scroll to left: 2000`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'primary',
			onclick: () => doScrollTo(0, 0),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Scroll to top-left corner`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div style="width: 1000px; height: 600px;">`);
		Grid($$renderer, { data, columns, split: { left: 1 } });
		$$renderer.push(`<!----></div></div>`);
	});
}