import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, SpeedDial, SpeedDialButton, Rating } from "flowbite-svelte";
import { ShareNodesSolid, PrinterSolid, DownloadSolid, FileCopySolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Rating`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Custom($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		color: 'green',
		class: 'absolute end-6 bottom-6 py-0',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Rating(node_1, { total: 1, rating: 0.5, size: 48 });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	SpeedDial(node_2, {
		placement: 'top-end',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_3 = $.first_child(fragment_2);

			SpeedDialButton(node_3, {
				name: 'Share',
				children: ($$anchor, $$slotProps) => {
					ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			SpeedDialButton(node_4, {
				name: 'Print',
				children: ($$anchor, $$slotProps) => {
					PrinterSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			SpeedDialButton(node_5, {
				name: 'Download',
				children: ($$anchor, $$slotProps) => {
					DownloadSolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			SpeedDialButton(node_6, {
				name: 'Copy',
				children: ($$anchor, $$slotProps) => {
					FileCopySolid($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}