import * as $ from 'svelte/internal/server';
import Button from "$lib/buttons/Button.svelte";
import CompoCard from "../utils/CompoCard.svelte";
import Section from "./utils/Section.svelte";

export default function Components($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		let components = $.derived(() => [
			...data.posts.forms,
			...data.posts.components,
			...data.posts.typography
		].sort((a, b) => a.meta.component_title.localeCompare(b.meta.component_title)));

		const INIT_COUNT = 18;
		let expanded = false;

		Section($$renderer, {
			class: 'flex flex-col gap-8 sm:gap-12 lg:pt-24',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex flex-col items-center gap-4 sm:gap-4"><h2 class="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl dark:text-white">Svelte UI components</h2> <p class="mx-auto max-w-3xl text-center text-lg font-normal text-gray-500 dark:text-gray-400">Explore the whole collection of <span class="font-medium text-gray-900 dark:text-white">over ${$.escape(components().length)} open-source</span> UI components and interactive elements built with Svelte and Flowbite</p></div> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3"><!--[-->`);

				const each_array = $.ensure_array_like(components().slice(0, INIT_COUNT));

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { path, meta: { dir, component_title, thumbnailSize } } = each_array[$$index];

					CompoCard($$renderer, { name: component_title, thumbnailSize, dir, path });
				}

				$$renderer.push(`<!--]--> `);

				if (expanded) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array_1 = $.ensure_array_like(components().slice(INIT_COUNT));

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let { path, meta: { dir, component_title, thumbnailSize } } = each_array_1[$$index_1];

						CompoCard($$renderer, { name: component_title, thumbnailSize, dir, path });
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (!expanded) {
					$$renderer.push(`<!--[0--><div class="mb-4 flex w-full justify-center">`);

					Button($$renderer, {
						size: 'md',
						class: 'hover:text-primary-600 focus:text-primary-600 whitespace-nowrap',
						color: 'alternative',
						onclick: () => expanded = true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->View all components`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}