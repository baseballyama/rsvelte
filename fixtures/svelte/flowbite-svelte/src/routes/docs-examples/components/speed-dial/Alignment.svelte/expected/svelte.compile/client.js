import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SpeedDial, SpeedDialTrigger, SpeedDialButton } from "flowbite-svelte";
import { ShareNodesSolid, PrinterSolid, DownloadSolid, FileCopySolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Alignment($$anchor) {
	const placements = [
		["start-2 top-2", "right", "bottom"],
		["end-6 top-2", "bottom", "left"],
		["end-6 bottom-6", "left", "top"],
		["start-2 bottom-6", "top", "right"]
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => placements, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 3));
		let position = () => $.get($$array)[0];
		let placement = () => $.get($$array)[1];
		let tooltip = () => $.get($$array)[2];
		var fragment_1 = root_1();
		var node_1 = $.first_child(fragment_1);

		SpeedDialTrigger(node_1, {
			get class() {
				return `absolute ${position() ?? ''}`;
			}
		});

		var node_2 = $.sibling(node_1, 2);

		SpeedDial(node_2, {
			get placement() {
				return placement();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_3 = $.first_child(fragment_2);

				SpeedDialButton(node_3, {
					name: 'Share',
					get tooltip() {
						return tooltip();
					},

					children: ($$anchor, $$slotProps) => {
						ShareNodesSolid($$anchor, { class: 'h-6 w-6' });
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				SpeedDialButton(node_4, {
					name: 'Print',
					get tooltip() {
						return tooltip();
					},

					children: ($$anchor, $$slotProps) => {
						PrinterSolid($$anchor, { class: 'h-6 w-6' });
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				SpeedDialButton(node_5, {
					name: 'Download',
					get tooltip() {
						return tooltip();
					},

					children: ($$anchor, $$slotProps) => {
						DownloadSolid($$anchor, { class: 'h-6 w-6' });
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				SpeedDialButton(node_6, {
					name: 'Copy',
					get tooltip() {
						return tooltip();
					},

					children: ($$anchor, $$slotProps) => {
						FileCopySolid($$anchor, { class: 'h-6 w-6' });
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}