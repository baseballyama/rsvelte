import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast } from "flowbite-svelte";
import { fly } from "svelte/transition";
import { DownloadOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);

export default function Fly($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		const icon = ($$anchor) => {
			DownloadOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node, {
			get transition() {
				return fly;
			},
			params: { x: 200 },
			color: 'green',
			class: 'mb-4',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Transition type: fly right');

				$.append($$anchor, text);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const icon = ($$anchor) => {
			DownloadOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node_1, {
			get transition() {
				return fly;
			},
			params: { y: 200 },
			color: 'green',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Transition type: fly down');

				$.append($$anchor, text_1);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}