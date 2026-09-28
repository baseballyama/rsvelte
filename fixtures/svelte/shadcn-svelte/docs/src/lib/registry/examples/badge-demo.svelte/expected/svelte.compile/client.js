import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
import { Badge } from "$lib/registry/ui/badge/index.js";

var root = $.from_html(`<!> Verified`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-center gap-2"><div class="flex w-full flex-wrap gap-2"><!> <!> <!> <!></div> <div class="flex w-full flex-wrap gap-2"><!> <!> <!> <!></div></div>`);

export default function Badge_demo($$anchor) {
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Badge(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Badge');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Badge(node_1, {
		variant: 'secondary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Secondary');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Badge(node_2, {
		variant: 'destructive',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Destructive');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Badge(node_3, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Outline');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.child(div_2);

	Badge(node_4, {
		variant: 'secondary',
		class: 'bg-blue-500 text-white dark:bg-blue-600',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_5 = $.first_child(fragment);

			BadgeCheckIcon(node_5, {});
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_4, 2);

	Badge(node_6, {
		class: 'h-5 min-w-5 rounded-full px-1 font-mono tabular-nums',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('8');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Badge(node_7, {
		class: 'h-5 min-w-5 rounded-full px-1 font-mono tabular-nums',
		variant: 'destructive',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('99');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Badge(node_8, {
		class: 'h-5 min-w-5 rounded-full px-1 font-mono tabular-nums',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('20+');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
}