import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast } from "flowbite-svelte";
import { slide, scale } from "svelte/transition";
import { quintOut } from "svelte/easing";
import { CheckCircleSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Transitions($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		const icon = ($$anchor) => {
			CheckCircleSolid($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node, {
			get transition() {
				return slide;
			},
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Transition type: slide');

				$.append($$anchor, text);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const icon = ($$anchor) => {
			CheckCircleSolid($$anchor, { class: 'h-6 w-6' });
		};

		let $0 = $.derived(() => ({ delay: 250, duration: 300, easing: quintOut }));

		Toast(node_1, {
			get transition() {
				return scale;
			},

			get params() {
				return $.get($0);
			},
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Transition type: scale, delay: 250, duration: 300, easing: quintOut');

				$.append($$anchor, text_1);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const icon = ($$anchor) => {
			CheckCircleSolid($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node_2, {
			params: { delay: 250, duration: 1000 },
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Transition type: fade, delay: 250, duration: 1000');

				$.append($$anchor, text_2);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}