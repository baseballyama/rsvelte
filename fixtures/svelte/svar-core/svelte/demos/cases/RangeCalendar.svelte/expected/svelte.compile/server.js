import * as $ from 'svelte/internal/server';
import { RangeCalendar } from "../../src/index";

export default function RangeCalendar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="demo-box"><h3>Range Calendar</h3> <div class="demo-hscroll">`);
		RangeCalendar($$renderer, { start: new Date(2022, 2, 18), end: new Date(2022, 2, 22) });
		$$renderer.push(`<!----></div> <div class="demo-hscroll">`);
		RangeCalendar($$renderer, { start: new Date(2022, 1, 18), end: new Date(2022, 2, 22) });
		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>Range Calendar without buttons</h3> <div class="demo-hscroll">`);
		RangeCalendar($$renderer, { buttons: false });
		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>Range Calendar with Done button</h3> <div class="demo-hscroll">`);
		RangeCalendar($$renderer, { buttons: ["done", "clear", "today"] });
		$$renderer.push(`<!----></div></div> <div class="demo-box" style="width: 160px"><h3>Single month</h3> `);
		RangeCalendar($$renderer, { months: 1 });
		$$renderer.push(`<!----></div>`);
	});
}