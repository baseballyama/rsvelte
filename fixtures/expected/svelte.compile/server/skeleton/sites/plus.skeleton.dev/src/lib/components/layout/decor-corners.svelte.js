import * as $ from 'svelte/internal/server';
import PlusIcon from '@lucide/svelte/icons/plus';

export default function Decor_corners($$renderer, $$props) {
	let { corners = [], class: classList, children } = $$props;

	const cornerClasses = {
		tl: 'top-0 left-0 translate-x-[-50%] translate-y-[-50%]',
		tr: 'top-0 right-0 translate-x-[50%] translate-y-[-50%]',
		bl: 'bottom-0 left-0 translate-x-[-50%] translate-y-[50%]',
		br: 'bottom-0 right-0 translate-x-[50%] translate-y-[50%]'
	};

	$$renderer.push(`<section class="relative"><!--[-->`);

	const each_array = $.ensure_array_like(corners);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let corner = each_array[$$index];

		PlusIcon($$renderer, {
			class: `absolute stroke-surface-600-400 size-elem-sm ${$.stringify(cornerClasses[corner])}`
		});
	}

	$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(classList))}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></div></section>`);
}