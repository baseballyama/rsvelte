import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	const variant_to_css = {
		default: 'c-btn',
		outlied: 'c-btn c-btn--outlined',
		pop: 'c-btn c-btn--pop',
		icon: 'c-btn c-btn--icon'
	};

	$$renderer.push(`<main class="mx-auto max-w-5xl p-10"><table class="border-collapse"><thead><tr class="*:bg-bg-100 *:border *:p-4"><th scope="col">Variant</th><th scope="col">Default</th><th scope="col">No Icon</th><th scope="col">Delayed</th><th scope="col">Timeout</th><th scope="col">Disabled</th></tr></thead><tbody><!--[-->`);

	const each_array = $.ensure_array_like(Object.entries(variant_to_css));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let [variant, css] = each_array[$$index];

		$$renderer.push(`<tr class="*:border *:p-4"><th class="text-left capitalize" scope="row">${$.escape(variant)}</th><td><button${$.attr_class($.clsx(css))}><i class="i i-[info] h-6 w-6"></i> <span${$.attr_class('', void 0, { 'sr-only': variant === 'icon' })}>Click me</span></button></td><td>`);

		if (variant !== 'icon') {
			$$renderer.push(`<!--[0--><button${$.attr_class($.clsx(css))}><span>Click me</span></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></td><td><button${$.attr_class($.clsx(css))} data-delayed=""><i class="i i-[info] h-6 w-6"></i> <span${$.attr_class('', void 0, { 'sr-only': variant === 'icon' })}>Click me</span></button></td><td><button${$.attr_class($.clsx(css))} data-timeout=""><i class="i i-[info] h-6 w-6"></i> <span${$.attr_class('', void 0, { 'sr-only': variant === 'icon' })}>Click me</span></button></td><td><button${$.attr_class($.clsx(css))} disabled=""><i class="i i-[info] h-6 w-6"></i> <span${$.attr_class('', void 0, { 'sr-only': variant === 'icon' })}>Click me</span></button></td></tr>`);
	}

	$$renderer.push(`<!--]--></tbody></table></main>`);
}