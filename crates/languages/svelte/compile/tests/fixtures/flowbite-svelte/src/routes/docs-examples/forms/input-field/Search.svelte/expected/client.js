import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Label, Button } from "flowbite-svelte";
import { SearchOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<form><!> <!></form>`);

export default function Search($$anchor) {
	var form = root();
	var node = $.child(form);

	Label(node, {
		for: 'search',
		class: 'mb-2 block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Your Email');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		const left = ($$anchor) => {
			SearchOutline($$anchor, { class: 'h-6 w-6 text-gray-500 dark:text-gray-400' });
		};

		const right = ($$anchor) => {
			Button($$anchor, {
				size: 'sm',
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Search');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		Input(node_1, {
			id: 'search',
			placeholder: 'Search',
			size: 'lg',
			class: 'ps-9',
			left,
			right,
			$$slots: { left: true, right: true }
		});
	}

	$.reset(form);
	$.append($$anchor, form);
}