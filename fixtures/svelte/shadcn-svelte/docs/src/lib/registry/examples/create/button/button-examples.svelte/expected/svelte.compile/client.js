import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Submit <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-wrap items-center gap-4"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div>`);

export default function Button_examples($$anchor) {
	Example($$anchor, {
		title: 'Examples',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			Button(node, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Cancel');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();
					var node_2 = $.sibling($.first_child(fragment_1));

					IconPlaceholder(node_2, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_3 = $.child(div_2);

			Button(node_3, {
				variant: 'destructive',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Delete');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				size: 'icon',
				children: ($$anchor, $$slotProps) => {
					IconPlaceholder($$anchor, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}