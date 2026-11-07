import * as $ from 'svelte/internal/server';
import { priorities } from "../data/data.js";

export default function Data_table_priority_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value } = $$props;
		const priority = $.derived(() => priorities.find((p) => p.value === value));

		if (priority()) {
			$$renderer.push(`<!--[0--><div class="flex items-center">`);

			if (priority().icon) {
				$$renderer.push('<!--[-->');
				priority().icon($$renderer, { class: 'me-2 size-4 text-muted-foreground' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <span>${$.escape(priority().label)}</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}