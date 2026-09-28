import * as $ from 'svelte/internal/server';
import Datepicker from '$lib/components/Datepicker.svelte';
import { dark } from '$lib/config/theme';
import SvgThing from '$lib/docs/SvgThing.svelte';
import dayjs from 'dayjs';

export default function Routes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const start = dayjs().add(-100, 'year').toDate();
		const end = dayjs().add(100, 'year').toDate();
		let selected;
		let store;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid svelte-u5cdty"><div class="column-primary svelte-u5cdty">`);
			SvgThing($$renderer, {});

			$$renderer.push(`<!----> <div class="title-section svelte-u5cdty"><div><h1 class="svelte-u5cdty">SVELTE-CALENDAR</h1> <pre class="svelte-u5cdty">
          npm i -D svelte-calendar
        </pre></div></div></div> <div class="column-secondary svelte-u5cdty">`);

			Datepicker($$renderer, {
				defaultTheme: dark,
				theme: { calendar: { width: '620px' } },
				start,
				end,
				get store() {
					return store;
				},

				set store($$value) {
					store = $$value;
					$$settled = false;
				},

				get selected() {
					return selected;
				},

				set selected($$value) {
					selected = $$value;
					$$settled = false;
				}
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