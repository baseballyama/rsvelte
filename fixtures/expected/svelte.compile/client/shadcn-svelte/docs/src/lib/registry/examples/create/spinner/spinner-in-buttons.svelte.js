import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Submit`, 1);
var root_1 = $.from_html(`<!> Disabled`, 1);
var root_2 = $.from_html(`<!> Outline`, 1);
var root_3 = $.from_html(`<!> <span class="sr-only">Loading...</span>`, 1);
var root_4 = $.from_html(`<div class="flex flex-wrap items-center gap-4"><!> <!> <!> <!></div>`);

export default function Spinner_in_buttons($$anchor) {
	Example($$anchor, {
		title: 'In Buttons',
		children: ($$anchor, $$slotProps) => {
			var div = root_4();
			var node = $.child(div);

			Button(node, {
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

			Button(node_2, {
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_3 = $.first_child(fragment_2);

					Spinner(node_3, { 'data-icon': 'inline-start' });
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Button(node_4, {
				variant: 'outline',
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_5 = $.first_child(fragment_3);

					Spinner(node_5, { 'data-icon': 'inline-start' });
					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Button(node_6, {
				variant: 'outline',
				size: 'icon',
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_3();
					var node_7 = $.first_child(fragment_4);

					Spinner(node_7, { 'data-icon': 'inline-start' });
					$.next(2);
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