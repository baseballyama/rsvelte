import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";
import { labels } from "../data/data.js";

export default function Data_table_title_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, labelValue } = $$props;
		const label = $.derived(() => labels.find((l) => l.value === labelValue));

		$$renderer.push(`<div class="flex space-x-2">`);

		if (label()) {
			$$renderer.push('<!--[0-->');

			Badge($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(label().label)}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span class="max-w-[500px] truncate font-medium">${$.escape(value)}</span></div>`);
	});
}