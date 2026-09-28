import * as $ from 'svelte/internal/server';
import { Heading } from "$lib";
import CompoDescription from "./CompoDescription.svelte";

export default function PageHeadSection($$renderer, $$props) {
	let { title, description } = $$props;

	$$renderer.push(`<div class="border-b border-gray-200 pb-8 dark:border-gray-800">`);

	Heading($$renderer, {
		class: 'mb-2 inline-block text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white',
		tag: 'h1',
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(title)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	CompoDescription($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(description)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}