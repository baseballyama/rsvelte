import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import Self from './toc.svelte';

export default function Toc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { toc, isChild = false, class: className } = $$props;

		$$renderer.push(`<ul${$.attr_class($.clsx(cn('m-0 list-none text-sm font-medium', { 'pl-4': isChild })))}><!--[-->`);

		const each_array = $.ensure_array_like(toc);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let heading = each_array[i];

			$$renderer.push(`<li${$.attr_class($.clsx(cn('text-muted-foreground mt-0 pt-2 transition-all', { 'text-foreground': heading.active })))}>`);

			if (heading.id) {
				$$renderer.push(`<!--[0--><a${$.attr('href', `#${$.stringify(heading.id)}`)} class="hover:text-foreground block">${$.escape(heading.label)}</a>`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(heading.label)}`);
			}

			$$renderer.push(`<!--]--></li> `);

			if (heading.children.length > 0) {
				$$renderer.push('<!--[0-->');
				Self($$renderer, { class: className, toc: heading.children, isChild: true });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></ul>`);
	});
}