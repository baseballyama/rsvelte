import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Badge`, 1);
var root_1 = $.from_html(`<div class="flex flex-wrap items-center justify-center gap-4"><!> <!> <!> <!></div>`);

export default function Spinner_in_badges($$anchor) {
	Example($$anchor, {
		title: 'In Badges',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			Badge(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Spinner(node_1, { 'data-icon': 'inline-start' });
					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Badge(node_2, {
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Spinner(node_3, { 'data-icon': 'inline-start' });
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Badge(node_4, {
				variant: 'destructive',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_5 = $.first_child(fragment_3);

					Spinner(node_5, { 'data-icon': 'inline-start' });
					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Badge(node_6, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_7 = $.first_child(fragment_4);

					Spinner(node_7, { 'data-icon': 'inline-start' });
					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}