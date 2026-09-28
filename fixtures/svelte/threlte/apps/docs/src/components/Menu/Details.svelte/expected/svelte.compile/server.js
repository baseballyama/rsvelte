import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Details($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let mounted = false;
		let { open = false, id = '', class: _class = '', summary, children } = $$props;

		onMount(() => {
			mounted = true;
		});

		$$renderer.push(`<details${$.attr('open', open, true)}${$.attr('id', id)}${$.attr_class(`block ${$.stringify(_class)}`, 'svelte-qinqw1')}><summary class="cursor-pointer list-none font-bold select-none svelte-qinqw1"><div class="mb-0 flex flex-row items-center">`);
		summary?.($$renderer);

		$$renderer.push(`<!----> <div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 1 16 16"${$.attr_class($.clsx([
			'ml-1 h-[1em] w-[1em] translate-y-px rotate-0 transition-all duration-200',
			open && '-translate-y-px rotate-90'
		]))} aria-hidden="true"><path fill-rule="evenodd" d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" class="fill-white"></path></svg></div></div></summary> <div>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div></details>`);
		$.bind_props($$props, { open });
	});
}