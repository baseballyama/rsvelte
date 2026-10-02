import * as $ from 'svelte/internal/server';
import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Payments_email_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { column } = $$props;

		Button($$renderer, {
			variant: 'ghost',
			onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Email `);
				ArrowUpDownIcon($$renderer, {});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}