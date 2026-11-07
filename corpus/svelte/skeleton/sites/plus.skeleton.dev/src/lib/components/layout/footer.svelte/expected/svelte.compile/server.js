import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import Skeleton from '$lib/components/branding/skeleton.svelte';
import { routes } from '$lib/navigation/routes';
import DecorCorners from './decor-corners.svelte';
import DecorStripes from './decor-stripes.svelte';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';

export default function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// A subset of routes in a set order
		const navColuns = {
			// TODO
			// overview: routes.overview,
			design: routes.design,
			content: routes.content,
			links: routes.links
		};

		$$renderer.push(`<footer class="container mx-auto border-t border-l border-r border-surface-200-800">`);

		DecorCorners($$renderer, {
			corners: ['tl', 'tr', 'bl', 'br'],
			class: 'container-cell grid grid-cols-2 md:grid-cols-3 gap-8',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(Object.entries(navColuns));

				for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
					let [section, items] = each_array[$$index_1];

					$$renderer.push(`<nav class="space-y-4"><h2 class="font-bold capitalize">${$.escape(section)}</h2> <ul class="space-y-2"><!--[-->`);

					const each_array_1 = $.ensure_array_like(items);

					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let { label, href, icon: Icon, enabled } = each_array_1[$$index];
						const external = href.startsWith('http');

						if (enabled) {
							$$renderer.push(`<!--[0--><li><a${$.attr('href', href)} class="inline-flex items-center gap-2 anchor"${$.attr('target', external ? '_blank' : undefined)}${$.attr('rel', external ? 'noopener noreferrer' : undefined)}>`);

							if (Icon) {
								$$renderer.push('<!--[0-->');

								if (Icon) {
									$$renderer.push('<!--[-->');
									Icon($$renderer, { class: 'size-elem-base' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> ${$.escape(label)} `);

							if (external) {
								$$renderer.push('<!--[0-->');
								ArrowUpRightIcon($$renderer, { class: 'size-elem-base' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></a></li>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--></ul></nav>`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		DecorStripes($$renderer, { class: 'h-6' });
		$$renderer.push(`<!----> <div class="container-cell flex justify-between items-center gap-4"><div class="flex items-center gap-2"><a${$.attr('href', resolve('/'))} aria-label="Homepage" title="Homepage" class="inline-flex">`);
		Skeleton($$renderer, { class: 'fill-current size-elem-2xl' });
		$$renderer.push(`<!----></a> <a href="https://www.skeletonlabs.co/" target="_blank" class="text-xs hover:underline">Skeleton Labs</a></div> <div class="flex items-center gap-4"><!--[-->`);

		const each_array_2 = $.ensure_array_like(routes.legal);

		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let { label, href } = each_array_2[$$index_2];

			$$renderer.push(`<a${$.attr('href', href)} class="text-xs hover:underline">${$.escape(label)}</a>`);
		}

		$$renderer.push(`<!--]--></div></div></footer>`);
	});
}