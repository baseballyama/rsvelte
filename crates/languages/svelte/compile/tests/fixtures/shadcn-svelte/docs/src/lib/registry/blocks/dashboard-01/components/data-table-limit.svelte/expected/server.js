import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Data_table_limit($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row } = $$props;

		$$renderer.push(`<form>`);

		Label($$renderer, {
			for: `${$.stringify(row.original.id)}-limit`,
			class: 'sr-only',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Limit`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Input($$renderer, {
			class: 'h-8 w-16 border-transparent bg-transparent text-end shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30',
			value: row.original.limit,
			id: `${$.stringify(row.original.id)}-limit`
		});

		$$renderer.push(`<!----></form>`);
	});
}