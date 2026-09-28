import * as $ from 'svelte/internal/server';
import { Icon } from "../../src/index";
import { icons } from "../data/icons";

export default function Icon_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const arrs = [];

		// split icons in block of 10 icons each
		for (let i = 0; i < icons.length; i += 16) {
			arrs.push(icons.slice(i, i + 16));
		}

		$$renderer.push(`<div class="demo-box"><h3>Icons</h3> <!--[-->`);

		const each_array = $.ensure_array_like(arrs);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let subset = each_array[$$index_1];

			$$renderer.push(`<div><!--[-->`);

			const each_array_1 = $.ensure_array_like(subset);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let icon = each_array_1[$$index];

				Icon($$renderer, { title: icon, css: icon });
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}