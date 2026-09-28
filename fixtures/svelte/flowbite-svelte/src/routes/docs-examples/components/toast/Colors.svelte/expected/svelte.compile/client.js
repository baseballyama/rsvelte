import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast } from "flowbite-svelte";

import {
	CheckCircleSolid,
	ExclamationCircleSolid,
	FireOutline,
	CloseCircleSolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <span class="sr-only">Check icon</span>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Error icon</span>`, 1);
var root_2 = $.from_html(`<!> <span class="sr-only">Warning icon</span>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Colors($$anchor) {
	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		const icon = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			CheckCircleSolid(node_1, { class: 'h-5 w-5' });
			$.next(2);
			$.append($$anchor, fragment_1);
		};

		Toast(node, {
			color: 'green',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Item moved successfully.');

				$.append($$anchor, text);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		const icon = ($$anchor) => {
			var fragment_2 = root_1();
			var node_3 = $.first_child(fragment_2);

			CloseCircleSolid(node_3, { class: 'h-5 w-5' });
			$.next(2);
			$.append($$anchor, fragment_2);
		};

		Toast(node_2, {
			color: 'red',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Item has been deleted.');

				$.append($$anchor, text_1);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		const icon = ($$anchor) => {
			var fragment_3 = root_2();
			var node_5 = $.first_child(fragment_3);

			ExclamationCircleSolid(node_5, { class: 'h-5 w-5' });
			$.next(2);
			$.append($$anchor, fragment_3);
		};

		Toast(node_4, {
			color: 'red',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Improve password difficulty.');

				$.append($$anchor, text_2);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_6 = $.sibling(node_4, 2);

	{
		const icon = ($$anchor) => {
			FireOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node_6, {
			color: 'gray',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text('Gray');

				$.append($$anchor, text_3);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_7 = $.sibling(node_6, 2);

	{
		const icon = ($$anchor) => {
			FireOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node_7, {
			color: 'yellow',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_4 = $.text('Yellow');

				$.append($$anchor, text_4);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_8 = $.sibling(node_7, 2);

	{
		const icon = ($$anchor) => {
			FireOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node_8, {
			color: 'blue',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_5 = $.text('Blue');

				$.append($$anchor, text_5);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_9 = $.sibling(node_8, 2);

	{
		const icon = ($$anchor) => {
			FireOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node_9, {
			color: 'indigo',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_6 = $.text('Indigo');

				$.append($$anchor, text_6);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_10 = $.sibling(node_9, 2);

	{
		const icon = ($$anchor) => {
			FireOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node_10, {
			color: 'purple',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_7 = $.text('Purple');

				$.append($$anchor, text_7);
			},
			$$slots: { icon: true, default: true }
		});
	}

	var node_11 = $.sibling(node_10, 2);

	{
		const icon = ($$anchor) => {
			FireOutline($$anchor, { class: 'h-6 w-6' });
		};

		Toast(node_11, {
			color: undefined,
			class: 'bg-pink-100 text-pink-500 dark:bg-pink-800 dark:text-pink-200',
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_8 = $.text('Customize your colors.');

				$.append($$anchor, text_8);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}