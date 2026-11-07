import * as $ from 'svelte/internal/server';
import { Button } from 'svelte-ux';
import { LoadingPlaceholder } from '@layerstack/docs/components';
import OpenWithButton from '$lib/components/OpenWithButton.svelte';
import { examples } from '@layerstack/docs/context';
import { page } from '$app/state';
import LucideChevronLeft from '~icons/lucide/chevron-left';
import LucideChevronRight from '~icons/lucide/chevron-right';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;
		const metadata = $.derived(() => data.metadata);

		// Add examples to context for Example component to use
		const examplesContext = {
			get current() {
				return data.examples;
			}
		};

		examples.set(examplesContext);
		$$renderer.push(`<div class="mb-4">`);

		if (page.params.example) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				size: 'sm',
				icon: LucideChevronLeft,
				href: `/docs/utils/${$.stringify(page.params.name)}`,
				class: 'mb-4 border',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Back to ${$.escape(page.params.name)}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="flex items-center gap-2 text-xs font-bold"><div class="text-surface-content/50 capitalize">${$.escape(metadata().category)}</div> `);

		if (page.params.example) {
			$$renderer.push('<!--[0-->');
			LucideChevronRight($$renderer, { class: 'text-sm opacity-25' });
			$$renderer.push(`<!----> <a${$.attr('href', `/docs/utils/${$.stringify(page.params.name)}`)} class="text-primary">${$.escape(metadata().name)}</a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="flex items-center gap-4"><h1 class="text-3xl font-bold">${$.escape(page.params.example?.replaceAll('-', ' ') ?? metadata().name)}</h1></div> `);

		if (page.params.example == null) {
			$$renderer.push(`<!--[0--><div class="text-sm text-surface-content/70">${$.escape(metadata().description)}</div> <div class="flex gap-2 mt-3">`);
			OpenWithButton($$renderer, { metadata: metadata() });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);
		$$renderer.push(`<!--[!-->`);

		{
			LoadingPlaceholder($$renderer, {});
		}

		$$renderer.push(`<!--]-->`);
	});
}