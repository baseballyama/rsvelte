import * as $ from 'svelte/internal/server';
import { format } from '@layerstack/utils';
import { Button, H1 } from '@layerstack/docs/markdown/components';
import LucideChevronLeft from '~icons/lucide/chevron-left';
import ReleaseContent from '../ReleaseContent.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const release = $.derived(() => data.release);

		$$renderer.push(`<div>`);

		Button($$renderer, {
			size: 'sm',
			icon: LucideChevronLeft,
			href: '/docs/releases',
			class: 'mb-2 border',
			children: ($$renderer) => {
				$$renderer.push(`<!---->All releases`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="mb-8">`);

		H1($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(release().title)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="flex items-center gap-3 text-sm text-surface-content/70 mb-4"><time${$.attr('datetime', release().date.toISOString())}>${$.escape(format(release().date, 'day', { variant: 'long' }))}</time> <span class="text-xs bg-surface-content/10 px-2 py-0.5 rounded border">${$.escape(release().tag)}</span> `);

		if (release().prerelease) {
			$$renderer.push(`<!--[0--><span class="text-xs bg-warning/10 px-2 py-0.5 rounded border border-warning text-warning">pre-release</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="flex gap-3"><a${$.attr('href', release().url)} target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline">View on GitHub →</a></div></div> `);
		ReleaseContent($$renderer, { release: release() });
		$$renderer.push(`<!----></div>`);
	});
}