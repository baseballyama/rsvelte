import * as $ from 'svelte/internal/server';
import { NavItem } from 'svelte-ux';
import { flatGroup } from 'd3-array';
import { allComponents, allUtils, allGuides } from 'content-collections';
import { sortCollection } from '@layerstack/docs/collections';
import { page } from '$app/state';
import { sortFunc } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';
import LucideBot from '~icons/lucide/bot';
import LucideCompass from '~icons/lucide/compass';
import LucideGalleryVertical from '~icons/lucide/gallery-vertical';
import LucideGalleryHorizontalEnd from '~icons/lucide/gallery-horizontal-end';
import LucideGalleryVerticalEnd from '~icons/lucide/gallery-vertical-end';
import LucideGlobe from '~icons/lucide/globe';
import LucideNotebookPen from '~icons/lucide/notebook-pen';
import LucideBlocks from '~icons/lucide/blocks';
import LucideFileCode2 from '~icons/lucide/file-code-2';
import LucideCirclePlay from '~icons/lucide/circle-play';
import LucideParentheses from '~icons/lucide/parentheses';
import SimpleIconsStackblitz from '~icons/simple-icons/stackblitz';

export default function DocsMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onItemClick, class: className } = $$props;
		const filteredGuides = allGuides.filter((g) => !g.draft);
		const guidesByCategory = flatGroup(filteredGuides, (d) => d.category?.toLowerCase()).sort(sortFunc(([category]) => category ? 1 : 0));
		const collapsibleCategories = ['migrations'];

		const componentsByCategory = flatGroup(allComponents, (d) => d.category?.toLowerCase()).filter(([category]) => category !== 'examples').sort(sortFunc(([category]) => [
			'charts',
			'common',
			'primitives',
			'marks',
			'geo',
			'layout',
			'interactions',
			'annotations',
			'fill',
			'clipping',
			'layers',
			'other'
		].indexOf(category)));

		function navItem($$renderer, { label, path, icon }) {
			NavItem($$renderer, {
				text: label,
				currentUrl: page.url,
				target: path.startsWith('http') ? '_blank' : undefined,
				path,
				icon,
				classes: {
					root: cls('relative text-sm text-surface-content/50 py-1 my-px rounded-r border-l border-transparent border-surface-content/5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary-600 -ml-px', icon ? 'pl-3' : 'pl-6'),
					active: cls('text-primary-400! border-primary! hover:bg-primary/10! font-medium bg-primary/10 border-l')
				}
			});
		}

		$$renderer.push(`<nav${$.attr_class($.clsx(cls('grid gap-6', className)))}><section class="border-l border-surface-content/10">`);

		navItem($$renderer, {
			label: 'Getting Started',
			path: '/docs/getting-started',
			icon: LucideCirclePlay
		});

		$$renderer.push(`<!----> `);

		navItem($$renderer, {
			label: 'Examples',
			path: '/docs/examples',
			icon: LucideFileCode2
		});

		$$renderer.push(`<!----> `);

		navItem($$renderer, {
			label: 'Showcase',
			path: '/docs/showcase',
			icon: LucideGalleryVertical
		});

		$$renderer.push(`<!----> `);

		navItem($$renderer, {
			label: 'Releases',
			path: '/docs/releases',
			icon: LucideNotebookPen
		});

		$$renderer.push(`<!----></section> <section><h2 class="flex gap-2 items-center mb-4 text-base font-semibold capitalize">`);
		LucideGlobe($$renderer, { class: 'size-4 text-surface-content/70' });
		$$renderer.push(`<!----> Guides</h2> <!--[-->`);

		const each_array = $.ensure_array_like(guidesByCategory);

		for (let $$index_3 = 0, $$length = each_array.length; $$index_3 < $$length; $$index_3++) {
			let [category, guides] = each_array[$$index_3];

			if (category && collapsibleCategories.includes(category)) {
				$$renderer.push(`<!--[0--><details class="ml-2 mb-6 last:mb-0 group"${$.attr('open', guides.some((g) => page.url.pathname.includes(`/docs/guides/${g.slug}`)), true)}><summary class="text-surface-content/80 mb-3 text-sm font-medium capitalize cursor-pointer list-none flex items-center gap-1 select-none [&amp;::-webkit-details-marker]:hidden"><span class="transition-transform duration-200 group-open:rotate-90 text-surface-content/40">▸</span> ${$.escape(category)}</summary> <div class="border-l border-surface-content/10"><!--[-->`);

				const each_array_1 = $.ensure_array_like(sortCollection(guides));

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let guide = each_array_1[$$index];

					navItem($$renderer, { label: guide.name, path: `/docs/guides/${guide.slug}` });
				}

				$$renderer.push(`<!--]--></div></details>`);
			} else if (category) {
				$$renderer.push(`<!--[1--><div class="ml-2 mb-6 last:mb-0"><h3 class="text-surface-content/80 mb-3 text-sm font-medium capitalize">${$.escape(category)}</h3> <div class="border-l border-surface-content/10"><!--[-->`);

				const each_array_2 = $.ensure_array_like(sortCollection(guides));

				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let guide = each_array_2[$$index_1];

					navItem($$renderer, { label: guide.name, path: `/docs/guides/${guide.slug}` });
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="ml-2 border-l border-surface-content/10 mb-6 last:mb-0"><!--[-->`);

				const each_array_3 = $.ensure_array_like(sortCollection(guides));

				for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
					let guide = each_array_3[$$index_2];

					navItem($$renderer, { label: guide.name, path: `/docs/guides/${guide.slug}` });
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></section> <section><h2 class="flex gap-2 items-center mb-4 text-base font-semibold capitalize">`);
		LucideBlocks($$renderer, { class: 'size-4 text-surface-content/70' });
		$$renderer.push(`<!----> Components</h2> <!--[-->`);

		const each_array_4 = $.ensure_array_like(componentsByCategory);

		for (let $$index_5 = 0, $$length = each_array_4.length; $$index_5 < $$length; $$index_5++) {
			let [category, components] = each_array_4[$$index_5];

			$$renderer.push(`<div class="ml-2 mb-6 last:mb-0"><h3 class="text-surface-content/80 mb-3 text-sm font-medium capitalize">${$.escape(category)}</h3> <div class="border-l border-surface-content/10"><!--[-->`);

			const each_array_5 = $.ensure_array_like(sortCollection(components));

			for (let $$index_4 = 0, $$length = each_array_5.length; $$index_4 < $$length; $$index_4++) {
				let component = each_array_5[$$index_4];

				navItem($$renderer, {
					label: component.name,
					path: `/docs/components/${component.slug}`
				});
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></section> <section><h2 class="flex gap-2 items-center mb-3 text-base font-semibold capitalize">`);
		LucideParentheses($$renderer, { class: 'size-4 text-surface-content/70' });
		$$renderer.push(`<!----> Utils</h2> <div class="ml-2 border-l border-surface-content/10"><!--[-->`);

		const each_array_6 = $.ensure_array_like(allUtils);

		for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
			let util = each_array_6[$$index_6];

			navItem($$renderer, { label: util.name, path: `/docs/utils/${util.slug}` });
		}

		$$renderer.push(`<!--]--></div></section></nav>`);
	});
}