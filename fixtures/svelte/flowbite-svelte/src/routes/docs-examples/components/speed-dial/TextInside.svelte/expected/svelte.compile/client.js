import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SpeedDial, SpeedDialTrigger, SpeedDialButton } from "flowbite-svelte";
import { ShareNodesSolid, PrinterSolid, DownloadSolid, FileCopySolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function TextInside($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	SpeedDialTrigger(node, { class: 'absolute end-24 bottom-6' });

	var node_1 = $.sibling(node, 2);

	SpeedDial(node_1, {
		tooltip: 'none',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			SpeedDialButton(node_2, {
				name: 'Share',
				textClass: 'text-blue-500',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			SpeedDialButton(node_3, {
				name: 'Print',
				children: ($$anchor, $$slotProps) => {
					PrinterSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			SpeedDialButton(node_4, {
				name: 'Save',
				children: ($$anchor, $$slotProps) => {
					DownloadSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			SpeedDialButton(node_5, {
				name: 'Copy',
				children: ($$anchor, $$slotProps) => {
					FileCopySolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_1, 2);

	SpeedDialTrigger(node_6, { class: 'absolute end-6 bottom-6' });

	var node_7 = $.sibling(node_6, 2);

	SpeedDial(node_7, {
		pill: false,
		tooltip: 'none',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_8 = $.first_child(fragment_6);

			SpeedDialButton(node_8, {
				name: 'Share',
				textClass: 'text-green-500',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			SpeedDialButton(node_9, {
				name: 'Print',
				children: ($$anchor, $$slotProps) => {
					PrinterSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			SpeedDialButton(node_10, {
				name: 'Save',
				children: ($$anchor, $$slotProps) => {
					DownloadSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			SpeedDialButton(node_11, {
				name: 'Copy',
				children: ($$anchor, $$slotProps) => {
					FileCopySolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}