import * as $ from 'svelte/internal/server';
import CircleCheckFilledIcon from "@tabler/icons-svelte/icons/circle-check-filled";
import LoaderIcon from "@tabler/icons-svelte/icons/loader";
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Data_table_status($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row } = $$props;

		Badge($$renderer, {
			variant: 'outline',
			class: 'px-1.5 text-muted-foreground',
			children: ($$renderer) => {
				if (row.original.status === "Done") {
					$$renderer.push('<!--[0-->');
					CircleCheckFilledIcon($$renderer, { class: 'fill-green-500 dark:fill-green-400' });
				} else {
					$$renderer.push('<!--[-1-->');
					LoaderIcon($$renderer, {});
				}

				$$renderer.push(`<!--]--> ${$.escape(row.original.status)}`);
			},
			$$slots: { default: true }
		});
	});
}