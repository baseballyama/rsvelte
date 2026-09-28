import * as $ from 'svelte/internal/server';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import ExternalLink from '@lucide/svelte/icons/external-link';
import { cn } from '$lib/utils';
import { useAddDropdownDocsLink } from './add.svelte.js';
import { mergeProps } from 'bits-ui';

export default function Add_dropdown_docs_link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...rest } = $$props;
		const docs = useAddDropdownDocsLink();
		const merged = $.derived(() => mergeProps(rest, docs.props));

		if (DropdownMenu.Item) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Item($$renderer, $.spread_props([
				{ class: cn('', className) },
				merged(),
				{
					children: ($$renderer) => {
						ExternalLink($$renderer, { class: 'size-4' });
						$$renderer.push(`<!----> <span class="text-sm">View CLI docs</span>`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}