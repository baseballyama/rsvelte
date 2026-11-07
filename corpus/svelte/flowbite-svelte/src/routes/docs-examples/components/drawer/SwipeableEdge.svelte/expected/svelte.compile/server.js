import * as $ from 'svelte/internal/server';
import { Drawer, DrawerHandle, CardPlaceholder } from "flowbite-svelte";

import {
	AdjustmentsVerticalSolid,
	ChartPieSolid,
	ClipboardListSolid,
	GridPlusSolid,
	ReceiptSolid,
	TableRowSolid,
	UsersSolid
} from "flowbite-svelte-icons";

export default function SwipeableEdge($$renderer) {
	let open = false;

	let widgets = [
		{ icon: ChartPieSolid, name: "Chart" },
		{ icon: TableRowSolid, name: "Table" },
		{ icon: ClipboardListSolid, name: "List" },
		{ icon: ReceiptSolid, name: "Ticket" },
		{ icon: UsersSolid, name: "Users" },
		{ icon: AdjustmentsVerticalSolid, name: "Custom" }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="ms-12 text-center">`);
		CardPlaceholder($$renderer, { size: '2xl', class: 'mt-6' });
		$$renderer.push(`<!----></div> `);

		Drawer($$renderer, {
			offset: '52px',
			placement: 'bottom',
			class: 'rounded-t-lg',
			'aria-labelledby': 'drawer-swipe-label',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				DrawerHandle($$renderer, {
					onclick: () => open = !open,
					class: 'h-14 hover:bg-gray-50 dark:hover:bg-gray-700',
					children: ($$renderer) => {
						$$renderer.push(`<h5 id="drawer-swipe-label" class="inline-flex items-center gap-2 text-base font-medium text-gray-500 dark:text-gray-400">`);
						GridPlusSolid($$renderer, {});
						$$renderer.push(`<!---->Add widget</h5>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-16 grid grid-cols-3 gap-4 lg:grid-cols-4"><!--[-->`);

				const each_array = $.ensure_array_like(widgets);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { icon: Icon, name } = each_array[$$index];

					$$renderer.push(`<div class="cursor-pointer rounded-lg bg-gray-50 p-4 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"><div class="mx-auto mb-2 flex h-[48px] max-h-[48px] w-[48px] max-w-[48px] items-center justify-center rounded-full bg-gray-200 p-2 dark:bg-gray-600">`);

					if (Icon) {
						$$renderer.push('<!--[-->');
						Icon($$renderer, { class: 'inline h-5 w-5 text-gray-500 dark:text-gray-400' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <div class="text-center font-medium text-gray-500 dark:text-gray-400">${$.escape(name)}</div></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}