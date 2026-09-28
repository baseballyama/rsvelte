import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Input } from "flowbite-svelte";
import { EnvelopeSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="mb-6"><!> <!></div>`);

export default function Icon($$anchor) {
	var div = root();
	var node = $.child(div);

	Label(node, {
		for: 'input-group-1',
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
			EnvelopeSolid($$anchor, { class: 'h-5 w-5 text-gray-500 dark:text-gray-400' });
		};

		Input(node_1, {
			id: 'email',
			type: 'email',
			placeholder: 'name@flowbite.com',
			class: 'pl-8',
			left,
			$$slots: { left: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}