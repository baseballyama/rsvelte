import * as $ from 'svelte/internal/server';

export default function Row($$renderer, $$props) {
	let {
		children,
		image,
		reversed = false,
		divide = false,
		contain = false,
		h_full = false
	} = $$props;

	$$renderer.push(`<div${$.attr_class(`flex self-stretch py-6 lg:gap-16 lg:py-10 ${reversed ? 'flex-row-reverse' : 'flex-row'}`)}><div class="hidden w-1/2 items-center lg:flex"><div${$.attr_class(`grow bg-no-repeat ${contain ? 'bg-contain' : 'bg-cover'} rounded-lg ${$.stringify(image)}`, void 0, { 'min-h-full': h_full, 'h-96': !h_full })}></div></div> <div${$.attr_class('flex w-1/2 grow flex-col items-start gap-4 lg:gap-8 dark:divide-gray-700', void 0, { 'divide-y': divide })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></div></div>`);
}