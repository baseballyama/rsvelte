import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SpeedDial, SpeedDialTrigger, SpeedDialButton } from "flowbite-svelte";
import { ShareNodesSolid, PrinterSolid, DownloadSolid, FileCopySolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Square($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	SpeedDialTrigger(node, { class: 'absolute end-6 bottom-6' });

	var node_1 = $.sibling(node, 2);

	SpeedDial(node_1, {
		pill: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			SpeedDialButton(node_2, {
				name: 'Share',
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
				name: 'Download',
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

	$.append($$anchor, fragment);
}