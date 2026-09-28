import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<h5 id="drawer-swipe-label" class="inline-flex items-center gap-2 text-base font-medium text-gray-500 dark:text-gray-400"><!>Add widget</h5>`);
var root_1 = $.from_html(`<div class="cursor-pointer rounded-lg bg-gray-50 p-4 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"><div class="mx-auto mb-2 flex h-[48px] max-h-[48px] w-[48px] max-w-[48px] items-center justify-center rounded-full bg-gray-200 p-2 dark:bg-gray-600"><!></div> <div class="text-center font-medium text-gray-500 dark:text-gray-400"> </div></div>`);
var root_2 = $.from_html(`<!> <div class="mt-16 grid grid-cols-3 gap-4 lg:grid-cols-4"></div>`, 1);
var root_3 = $.from_html(`<div class="ms-12 text-center"><!></div> <!>`, 1);

export default function SwipeableEdge($$anchor) {
	let open = $.state(false);

	let widgets = [
		{ icon: ChartPieSolid, name: "Chart" },
		{ icon: TableRowSolid, name: "Table" },
		{ icon: ClipboardListSolid, name: "List" },
		{ icon: ReceiptSolid, name: "Ticket" },
		{ icon: UsersSolid, name: "Users" },
		{ icon: AdjustmentsVerticalSolid, name: "Custom" }
	];

	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	CardPlaceholder(node, { size: '2xl', class: 'mt-6' });
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Drawer(node_1, {
		offset: '52px',
		placement: 'bottom',
		class: 'rounded-t-lg',
		'aria-labelledby': 'drawer-swipe-label',
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_2 = $.first_child(fragment_1);

			DrawerHandle(node_2, {
				onclick: () => $.set(open, !$.get(open)),
				class: 'h-14 hover:bg-gray-50 dark:hover:bg-gray-700',
				children: ($$anchor, $$slotProps) => {
					var h5 = root();
					var node_3 = $.child(h5);

					GridPlusSolid(node_3, {});
					$.next();
					$.reset(h5);
					$.append($$anchor, h5);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_2, 2);

			$.each(div_1, 21, () => widgets, $.index, ($$anchor, $$item) => {
				let Icon = () => $.get($$item).icon;
				let name = () => $.get($$item).name;
				var div_2 = root_1();
				var div_3 = $.child(div_2);
				var node_4 = $.child(div_3);

				$.component(node_4, Icon, ($$anchor, Icon_1) => {
					Icon_1($$anchor, { class: 'inline h-5 w-5 text-gray-500 dark:text-gray-400' });
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var text = $.only_child(div_4, true);

				$.reset(div_2);
				$.template_effect(() => $.set_text(text, name()));
				$.append($$anchor, div_2);
			});

			$.reset(div_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}