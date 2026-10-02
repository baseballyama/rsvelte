import * as $ from 'svelte/internal/server';

const bars = Array(12).fill(0);

export default function Loader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { visible, class: className } = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(['sonner-loading-wrapper', className].filter(Boolean).join(' ')))}${$.attr('data-visible', visible)}><div class="sonner-spinner"><!--[-->`);

		const each_array = $.ensure_array_like(bars);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let _ = each_array[i];

			$$renderer.push(`<div class="sonner-loading-bar"></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}