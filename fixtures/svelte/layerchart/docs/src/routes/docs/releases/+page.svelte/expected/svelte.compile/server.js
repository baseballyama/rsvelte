import * as $ from 'svelte/internal/server';
import { H1 } from '@layerstack/docs/markdown/components';
import { format } from '@layerstack/utils';
import { Button } from 'svelte-ux';
import ReleaseContent from './ReleaseContent.svelte';
import LucideChevronLeft from '~icons/lucide/chevron-left';
import LucideChevronRight from '~icons/lucide/chevron-right';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const pagination = $.derived(() => data.pagination);

		$$renderer.push(`<div class="prose max-w-4xl">`);

		H1($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Releases <span class="text-xl text-surface-content/70">(${$.escape(pagination().totalReleases)})</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="space-y-6 mt-8"><!--[-->`);

		const each_array = $.ensure_array_like(data.releases);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let release = each_array[$$index];

			$$renderer.push(`<article class="border-b pb-6 last:border-b-0"><div class="flex items-start justify-between gap-4"><div class="flex-1"><h2 class="text-2xl font-semibold mb-2"><a${$.attr('href', `/docs/releases/${$.stringify(release.slug)}`)} class="hover:text-primary no-underline">${$.escape(release.title)}</a></h2> <div class="flex items-center gap-3 text-sm text-surface-content/70 mb-3"><time${$.attr('datetime', release.date.toISOString())}>${$.escape(format(release.date, 'day', { variant: 'long' }))}</time> <span class="text-xs bg-surface-content/10 px-2 py-0.5 rounded border">${$.escape(release.tag)}</span> `);

			if (release.prerelease) {
				$$renderer.push(`<!--[0--><span class="text-xs bg-warning/10 px-2 py-0.5 rounded border border-warning text-warning">pre-release</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div> `);
			ReleaseContent($$renderer, { release });
			$$renderer.push(`<!----></article>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (pagination().totalPages > 1) {
			$$renderer.push(`<!--[0--><div class="flex items-center justify-between mt-8 pt-6 border-t">`);

			Button($$renderer, {
				href: `/docs/releases?page=${$.stringify(pagination().currentPage - 1)}`,
				icon: LucideChevronLeft,
				disabled: !pagination().hasPrevPage,
				variant: 'outline',
				size: 'sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Previous`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="text-sm text-surface-content/70">Page ${$.escape(pagination().currentPage)} of ${$.escape(pagination().totalPages)}</div> `);

			{
				function append($$renderer) {
					LucideChevronRight($$renderer, {});
				}

				Button($$renderer, {
					href: `/docs/releases?page=${$.stringify(pagination().currentPage + 1)}`,
					disabled: !pagination().hasNextPage,
					variant: 'outline',
					size: 'sm',
					append,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Next`);
					},
					$$slots: { append: true, default: true }
				});
			}

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}