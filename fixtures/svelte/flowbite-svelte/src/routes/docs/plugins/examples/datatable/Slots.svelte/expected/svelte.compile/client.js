import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table } from "@flowbite-svelte-plugins/datatable";
import { P, Heading } from "flowbite-svelte";
import items from "./data/sample.json";

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(`<tr><td class="text-left text-base leading-normal font-normal tracking-normal whitespace-normal text-gray-900 dark:text-white">Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laboriosam placeat eum facilis aliquam, adipisci consequuntur excepturi rerum distinctio illum quibusdam neque magni quaerat
        dolorum hic labore repellat omnis? Quisquam?</td></tr>`);

export default function Slots($$anchor) {
	{
		const captionSlot = ($$anchor) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Heading(node, {
				tag: 'h4',
				class: 'text-left',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Caption');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			P(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Browse a list of Flowbite products designed to help you work and play, stay organized, get answers, keep in touch, grow your business, and more.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		const footerSlot = ($$anchor) => {
			var tr = root_1();
			var td = $.child(tr);

			$.set_attribute(td, 'colspan', 4);
			$.reset(tr);
			$.append($$anchor, tr);
		};

		Table($$anchor, {
			get items() {
				return items;
			},
			captionSlot,
			footerSlot,
			$$slots: { captionSlot: true, footerSlot: true }
		});
	}
}