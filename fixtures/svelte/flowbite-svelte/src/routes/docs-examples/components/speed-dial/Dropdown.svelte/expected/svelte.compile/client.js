import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SpeedDial, SpeedDialTrigger, Listgroup, ListgroupItem } from "flowbite-svelte";

import {
	DotsHorizontalOutline,
	DotsVerticalOutline,
	ShareNodesSolid,
	PrinterSolid,
	DownloadSolid,
	FileCopySolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> Share`, 1);
var root_1 = $.from_html(`<!> Print`, 1);
var root_2 = $.from_html(`<!> Save`, 1);
var root_3 = $.from_html(`<!> Copy`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Dropdown($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	{
		const icon = ($$anchor) => {
			DotsHorizontalOutline($$anchor, { class: 'h-8 w-8' });
		};

		SpeedDialTrigger(node, {
			class: 'absolute end-24 bottom-6',
			icon,
			$$slots: { icon: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	SpeedDial(node_1, {
		tooltip: 'none',
		placement: 'top-end',
		children: ($$anchor, $$slotProps) => {
			Listgroup($$anchor, {
				class: 'divide-none',
				active: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_4();
					var node_2 = $.first_child(fragment_3);

					ListgroupItem(node_2, {
						class: 'flex gap-2 md:px-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_3 = $.first_child(fragment_4);

							ShareNodesSolid(node_3, { class: 'h-5 w-5' });
							$.next();
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_2, 2);

					ListgroupItem(node_4, {
						class: 'flex gap-2 md:px-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_5 = $.first_child(fragment_5);

							PrinterSolid(node_5, { class: 'h-5 w-5' });
							$.next();
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_4, 2);

					ListgroupItem(node_6, {
						class: 'flex gap-2 md:px-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_2();
							var node_7 = $.first_child(fragment_6);

							DownloadSolid(node_7, { class: 'h-5 w-5' });
							$.next();
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_6, 2);

					ListgroupItem(node_8, {
						class: 'flex gap-2 md:px-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_3();
							var node_9 = $.first_child(fragment_7);

							FileCopySolid(node_9, { class: 'h-5 w-5' });
							$.next();
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_1, 2);

	{
		const icon = ($$anchor) => {
			DotsVerticalOutline($$anchor, { class: 'h-8 w-8' });
		};

		SpeedDialTrigger(node_10, {
			class: 'absolute end-6 bottom-6',
			icon,
			$$slots: { icon: true }
		});
	}

	var node_11 = $.sibling(node_10, 2);

	SpeedDial(node_11, {
		tooltip: 'none',
		pill: false,
		placement: 'top-end',
		children: ($$anchor, $$slotProps) => {
			Listgroup($$anchor, {
				class: 'divide-none',
				active: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_4();
					var node_12 = $.first_child(fragment_10);

					ListgroupItem(node_12, {
						class: 'flex gap-2 md:px-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root();
							var node_13 = $.first_child(fragment_11);

							ShareNodesSolid(node_13, { class: 'h-5 w-5' });
							$.next();
							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_12, 2);

					ListgroupItem(node_14, {
						class: 'flex gap-2 md:px-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_1();
							var node_15 = $.first_child(fragment_12);

							PrinterSolid(node_15, { class: 'h-5 w-5' });
							$.next();
							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_14, 2);

					ListgroupItem(node_16, {
						class: 'flex gap-2 md:px-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_2();
							var node_17 = $.first_child(fragment_13);

							DownloadSolid(node_17, { class: 'h-5 w-5' });
							$.next();
							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_16, 2);

					ListgroupItem(node_18, {
						class: 'flex gap-2 md:px-5',
						children: ($$anchor, $$slotProps) => {
							var fragment_14 = root_3();
							var node_19 = $.first_child(fragment_14);

							FileCopySolid(node_19, { class: 'h-5 w-5' });
							$.next();
							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}