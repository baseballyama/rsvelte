import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Data_table_type($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row } = $$props;

		$$renderer.push(`<div class="w-32">`);

		Badge($$renderer, {
			variant: 'outline',
			class: 'px-1.5 text-muted-foreground',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(row.original.type)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}