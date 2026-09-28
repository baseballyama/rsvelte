import * as $ from 'svelte/internal/server';
import { Table } from "@flowbite-svelte-plugins/datatable";
import { P, Heading } from "flowbite-svelte";
import items from "./data/sample.json";

export default function Slots($$renderer) {
	{
		function captionSlot($$renderer) {
			Heading($$renderer, {
				tag: 'h4',
				class: 'text-left',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Caption`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			P($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Browse a list of Flowbite products designed to help you work and play, stay organized, get answers, keep in touch, grow your business, and more.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		function footerSlot($$renderer) {
			$$renderer.push(`<tr><td${$.attr('colspan', 4)} class="text-left text-base leading-normal font-normal tracking-normal whitespace-normal text-gray-900 dark:text-white">Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias laboriosam placeat eum facilis aliquam, adipisci consequuntur excepturi rerum distinctio illum quibusdam neque magni quaerat
        dolorum hic labore repellat omnis? Quisquam?</td></tr>`);
		}

		Table($$renderer, {
			items,
			captionSlot,
			footerSlot,
			$$slots: { captionSlot: true, footerSlot: true }
		});
	}
}