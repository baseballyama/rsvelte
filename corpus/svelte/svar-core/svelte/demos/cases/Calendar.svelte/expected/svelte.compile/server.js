import * as $ from 'svelte/internal/server';
import { Calendar, Locale } from "../../src/index";
import { de, cn } from "@svar-ui/core-locales";

export default function Calendar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const markLine = (v) => v >= new Date(2022, 2, 13) && v <= new Date(2022, 2, 19) ? "inrange" : "";
		const markLine2 = (v) => v >= new Date(2022, 2, 8) && v <= new Date(2022, 2, 29) ? "inrange" : "";

		$$renderer.push(`<div class="demo-box"><h3>Calendar</h3> <div class="calendars svelte-1k56x1f">`);
		Calendar($$renderer, { value: new Date(2022, 2, 18) });
		$$renderer.push(`<!----> `);
		Calendar($$renderer, { current: new Date(2022, 2, 18), markers: markLine });
		$$renderer.push(`<!----> `);
		Calendar($$renderer, { current: new Date(2022, 2, 18), markers: markLine2 });
		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>Calendar with Locale and Format</h3> <div class="calendars svelte-1k56x1f">`);

		Locale($$renderer, {
			words: de,
			children: ($$renderer) => {
				Calendar($$renderer, { value: new Date(2022, 2, 18) });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Locale($$renderer, {
			words: cn,
			children: ($$renderer) => {
				Calendar($$renderer, { value: new Date(2022, 2, 18) });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Locale($$renderer, {
			words: {
				...cn,
				formats: { ...cn.formats, monthYearFormat: "%Y年%F", yearFormat: "%Y年" }
			},

			children: ($$renderer) => {
				Calendar($$renderer, { value: new Date(2022, 2, 18) });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="calendars svelte-1k56x1f"><div class="demo-box"><h3>Calendar without buttons</h3> `);
		Calendar($$renderer, { value: new Date(2022, 2, 18), buttons: false });
		$$renderer.push(`<!----></div> <div class="demo-box" style="width: 300px; margin-top: 20px"><h3>Calendar with Today button only</h3> `);
		Calendar($$renderer, { value: new Date(2022, 2, 18), buttons: ["today"] });
		$$renderer.push(`<!----></div></div>`);
	});
}