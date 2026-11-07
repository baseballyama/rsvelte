import * as $ from 'svelte/internal/server';
import { Pager } from "../../src/index";

export default function Pager_1($$renderer) {
	let value = 2;
	let pageSize = 10;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>100 rows (active = ${$.escape(value)}, page size = ${$.escape(pageSize)})</h3> `);

		Pager($$renderer, {
			total: 100,
			get pageSize() {
				return pageSize;
			},

			set pageSize($$value) {
				pageSize = $$value;
				$$settled = false;
			},

			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}