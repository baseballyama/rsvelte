import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-wrap gap-2"><!> <!> <!> <!> <!> <!></div>`);

export default function Badge_variants($$anchor) {
	Example($$anchor, {
		title: 'Variants',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Badge(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Default');

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

			var node_4 = $.sibling(node_3, 2);

			Badge(node_4, {
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Ghost');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Badge(node_5, {
				variant: 'link',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Link');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}