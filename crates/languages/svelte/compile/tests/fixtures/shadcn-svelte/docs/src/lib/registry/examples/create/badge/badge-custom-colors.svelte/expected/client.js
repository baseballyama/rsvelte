import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-wrap gap-2"><!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function Badge_custom_colors($$anchor) {
	Example($$anchor, {
		title: 'Custom Colors',
		class: 'max-w-fit',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Badge(node, {
				class: 'bg-blue-600 text-blue-50 dark:bg-blue-600 dark:text-blue-50',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Blue');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Badge(node_1, {
				class: 'bg-green-600 text-green-50 dark:bg-green-600 dark:text-green-50',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Green');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Badge(node_2, {
				class: 'bg-sky-600 text-sky-50 dark:bg-sky-600 dark:text-sky-50',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Sky');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Badge(node_3, {
				class: 'bg-purple-600 text-purple-50 dark:bg-purple-600 dark:text-purple-50',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Purple');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Badge(node_4, {
				class: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Blue');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Badge(node_5, {
				class: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Green');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Badge(node_6, {
				class: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Sky');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Badge(node_7, {
				class: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Purple');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Badge(node_8, {
				class: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Red');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}