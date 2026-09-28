import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<div class="flex flex-col items-start gap-8 sm:flex-row"><div class="flex items-start gap-2"><!> <!></div> <div class="flex items-start gap-2"><!> <!></div> <div class="flex items-start gap-2"><!> <!></div></div>`);

export default function Button_size($$anchor) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		size: 'sm',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Small');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		size: 'icon-sm',
		'aria-label': 'Submit',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			ArrowUpRightIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Button(node_2, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Default');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		size: 'icon',
		'aria-label': 'Submit',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			ArrowUpRightIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_4 = $.child(div_3);

	Button(node_4, {
		variant: 'outline',
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Large');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		size: 'icon-lg',
		'aria-label': 'Submit',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			ArrowUpRightIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
}