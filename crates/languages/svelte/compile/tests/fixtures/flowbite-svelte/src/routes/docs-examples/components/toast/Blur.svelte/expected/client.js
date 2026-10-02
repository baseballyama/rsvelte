import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast } from "flowbite-svelte";
import { blur } from "svelte/transition";
import { BellOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!>`, 1);

export default function Blur($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		const icon = ($$anchor) => {
			BellOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node, {
			get transition() {
				return blur;
			},
			color: 'purple',
			params: { amount: 10 },
			class: 'mb-4',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Transition type: blur, amount: 10');

				$.append($$anchor, text);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const icon = ($$anchor) => {
			BellOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node_1, {
			get transition() {
				return blur;
			},
			color: 'purple',
			params: { amount: 50, delay: 1000 },
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Transition type: blur, amount: 50, delay: 1000');

				$.append($$anchor, text_1);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}