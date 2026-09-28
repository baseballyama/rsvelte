import * as $ from 'svelte/internal/server';
import { Month } from "../../src/index";
import { getContext } from "svelte";

export default function Month_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const helpers = getContext("wx-helpers");
		const value = new Date(2025, 4, 1);

		const addMonth = (date, n) => {
			const next = new Date(date);

			next.setMonth(next.getMonth() + n);

			return next;
		};

		function onchange(date) {
			helpers.showNotice({ text: "click on " + date.toString().substring(0, 15) });
		}

		$$renderer.push(`<div class="demo-box"><h3>Month view</h3> <div class="row svelte-t2pv3"><div class="cell svelte-t2pv3">`);
		Month($$renderer, { current: addMonth(value, 0), onchange });
		$$renderer.push(`<!----></div> <div class="cell svelte-t2pv3">`);
		Month($$renderer, { current: addMonth(value, 1), onchange });
		$$renderer.push(`<!----></div> <div class="cell svelte-t2pv3">`);
		Month($$renderer, { current: addMonth(value, 2), onchange });
		$$renderer.push(`<!----></div></div></div> <div class="demo-box custom svelte-t2pv3"><h3>Month view with custom styles</h3> `);
		Month($$renderer, { current: new Date(2022, 2, 18) });
		$$renderer.push(`<!----></div>`);
	});
}