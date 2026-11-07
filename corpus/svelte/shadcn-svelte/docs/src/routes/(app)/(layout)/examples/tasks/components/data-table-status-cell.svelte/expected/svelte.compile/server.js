import * as $ from 'svelte/internal/server';
import { statuses } from "../data/data.js";

export default function Data_table_status_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value } = $$props;
		const status = $.derived(() => statuses.find((s) => s.value === value));

		if (status()) {
			$$renderer.push(`<!--[0--><div class="flex w-[100px] items-center">`);

			if (status().icon) {
				$$renderer.push('<!--[-->');
				status().icon($$renderer, { class: 'me-2 size-4 text-muted-foreground' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <span>${$.escape(status().label)}</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}