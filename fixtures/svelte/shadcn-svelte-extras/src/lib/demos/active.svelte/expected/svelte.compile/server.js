import * as $ from 'svelte/internal/server';
import { active } from '$lib/actions/active.svelte';

export default function Active($$renderer) {
	const links = [
		{ title: 'Button', href: '#/', isHash: true },
		{ title: 'Code', href: '#code', isHash: true },
		{ title: 'Field Set', href: '#field-set', isHash: true }
	];

	$$renderer.push(`<div class="flex w-full max-w-[200px] flex-col gap-1"><span class="text-muted-foreground text-xs font-medium">Components</span> <div class="flex flex-col"><!--[-->`);

	const each_array = $.ensure_array_like(links);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { title, href, isHash } = each_array[$$index];

		$$renderer.push(`<a${$.attr('href', href)} class="text-muted-foreground data-[active=true]:border-l-primary data-[active=true]:bg-secondary data-[active=true]:text-primary data-[active=false]:hover:border-l-secondary data-[active=false]:hover:bg-secondary/50 rounded-r-md border-l-2 border-transparent px-4 py-1 transition-all">${$.escape(title)}</a>`);
	}

	$$renderer.push(`<!--]--></div></div>`);
}