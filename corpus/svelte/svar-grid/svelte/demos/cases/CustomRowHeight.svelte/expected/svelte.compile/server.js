import * as $ from 'svelte/internal/server';
import { Button } from "@svar-ui/svelte-core";
import { Grid } from "../../src/";
import { repeatData, getData } from "../data";

export default function CustomRowHeight($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { columns } = getData();

		const data = repeatData(50).map((row, i) => {
			const hcase = i % 10;

			if (hcase === 2) return { ...row, rowHeight: 50 };
			if (hcase === 5) return { ...row, rowHeight: 75 };
			if (hcase === 7) return { ...row, rowHeight: 100 };

			return row;
		});

		let api = void 0;

		function doScroll(row) {
			api.exec("scroll", { row });
		}

		$$renderer.push(`<div style="padding: 20px;"><h4>DataGrid can have custom row heights</h4> <div style="padding-bottom: 20px; display:flex; flex-direction: columns; gap: 20px;">`);

		Button($$renderer, {
			type: 'primary',
			onclick: () => doScroll(data[49].id),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Scroll: last row`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'primary',
			onclick: () => doScroll(data[0].id),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Scroll: first row`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'primary',
			onclick: () => doScroll(data[17].id),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Scroll: row id 18`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'primary',
			onclick: () => doScroll(data[42].id),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Scroll: row id 43`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div style="height: 510px;">`);
		Grid($$renderer, { data, columns, footer: true, reorder: true });
		$$renderer.push(`<!----></div></div>`);
	});
}