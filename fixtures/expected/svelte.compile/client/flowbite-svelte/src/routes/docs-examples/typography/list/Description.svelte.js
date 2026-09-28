import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { List, DescriptionList } from "flowbite-svelte";

var root = $.from_html(`<div class="flex flex-col pb-3"><!> <!></div> <div class="flex flex-col pb-3"><!> <!></div> <div class="flex flex-col pb-3"><!> <!></div>`, 1);

export default function Description($$anchor) {
	List($$anchor, {
		tag: 'dl',
		class: 'divide-y divide-gray-200 text-gray-900 dark:divide-gray-700  dark:text-white',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			DescriptionList(node, {
				tag: 'dt',
				class: 'mb-1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Email address');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			DescriptionList(node_1, {
				tag: 'dd',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('yourname@flowbite.com');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_2 = $.child(div_1);

			DescriptionList(node_2, {
				tag: 'dt',
				class: 'mb-1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Home address');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			DescriptionList(node_3, {
				tag: 'dd',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('92 Miles Drive, Newark, NJ 07103, California, USA');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_4 = $.child(div_2);

			DescriptionList(node_4, {
				tag: 'dt',
				class: 'mb-1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Phone number');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			DescriptionList(node_5, {
				tag: 'dd',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('+00 123 456 789 / +12 345 678');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}