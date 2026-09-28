import * as $ from 'svelte/internal/server';

export default function MenuLabel($$renderer, $$props) {
	let {
		align = 'left',
		class: cls,
		for: forHtml,
		children,
		$$slots,
		$$events,
		...rest
	} = $$props;

	const commonPathClasses = `transition-transform origin-left`;

	$$renderer.push(`<label${$.attributes(
		{
			class: `hover:text-link group flex cursor-pointer items-center gap-2 text-xs ${$.stringify(cls)}`,
			for: forHtml,
			...rest
		},
		void 0,
		{ 'flex-row-reverse': align === 'right' }
	)}><span class="sr-only">Menu</span> <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="24" width="24"${$.attr_class('inline h-6 w-6', void 0, { '-scale-x-100': align === 'right' })} fill="currentcolor"><path class="transition-transform origin-left group-hover:scale-x-75" d="M21,7H3C2.4,7,2,6.6,2,6s0.4-1,1-1h18c0.6,0,1,0.4,1,1S21.6,7,21,7z"></path><path class="transition-transform origin-left group-hover:scale-x-125" d="M17,11H3c-0.6,0-1-0.4-1-1s0.4-1,1-1h14c0.6,0,1,0.4,1,1S17.6,11,17,11z"></path><path class="transition-transform origin-left group-hover:scale-x-75" d="M21,15H3c-0.6,0-1-0.4-1-1s0.4-1,1-1h18c0.6,0,1,0.4,1,1S21.6,15,21,15z"></path><path class="transition-transform origin-left group-hover:scale-x-125" d="M17,19H3c-0.6,0-1-0.4-1-1s0.4-1,1-1h14c0.6,0,1,0.4,1,1S17.6,19,17,19z"></path></svg> `);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></label>`);
}