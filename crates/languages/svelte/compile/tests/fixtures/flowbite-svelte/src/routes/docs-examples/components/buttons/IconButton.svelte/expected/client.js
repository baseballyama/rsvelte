import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "flowbite-svelte";
import { ThumbsUpSolid, ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function IconButton($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		class: 'p-2!',
		children: ($$anchor, $$slotProps) => {
			ArrowRightOutline($$anchor, { class: 'h-6 w-6' });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		pill: true,
		class: 'p-2!',
		children: ($$anchor, $$slotProps) => {
			ArrowRightOutline($$anchor, { class: 'h-6 w-6' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		outline: true,
		class: 'p-2!',
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			ThumbsUpSolid($$anchor, { class: 'text-primary-700 h-7 w-7' });
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		pill: true,
		outline: true,
		class: 'p-2!',
		size: 'xl',
		children: ($$anchor, $$slotProps) => {
			ThumbsUpSolid($$anchor, { class: 'text-primary-700 h-6 w-6' });
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}